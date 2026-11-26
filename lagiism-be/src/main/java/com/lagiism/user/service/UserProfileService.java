package com.lagiism.user.service;

import com.lagiism.account.entity.User;
import com.lagiism.account.repository.UserRepository;
import com.lagiism.account.service.AuditLogService;
import com.lagiism.shared.BadRequestException;
import com.lagiism.shared.ResourceNotFoundException;
import com.lagiism.user.dto.*;
import com.lagiism.user.entity.Order;
import com.lagiism.user.entity.OrderItem;
import com.lagiism.user.mapper.UserModuleMapper;
import com.lagiism.user.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private static final DateTimeFormatter ORDER_DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final Set<String> VALID_STATUSES = Set.of(
            "PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"
    );

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final UserModuleMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(String email) {
        User user = getUserByEmail(email);
        return mapper.toProfileDto(user);
    }

    @Transactional
    public UserProfileDto updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);
        mapper.applyProfileUpdate(user, request);
        User saved = userRepository.save(user);
        return mapper.toProfileDto(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getOrderHistory(String email) {
        User user = getUserByEmail(email);
        return orderRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(mapper::toOrderDto)
                .toList();
    }

    @Transactional
    public OrderDto placeOrder(String email, CreateOrderRequest request) {
        User user = getUserByEmail(email);
        Order saved = createOrderInternal(
                user,
                "WEBSITE",
                normalizePayment(request.paymentMethod()),
                "CONFIRMED",
                request.recipientName(),
                request.recipientPhone(),
                request.shippingAddress(),
                request.shippingCity(),
                request.note(),
                request.items()
        );
        syncUserDefaultsIfEmpty(user, saved);
        return mapper.toOrderDto(saved);
    }

    @Transactional
    public OrderDto placeGuestOrder(CreateOrderRequest request) {
        Order saved = createOrderInternal(
                null,
                "WEBSITE",
                normalizePayment(request.paymentMethod()),
                "CONFIRMED",
                request.recipientName(),
                request.recipientPhone(),
                request.shippingAddress(),
                request.shippingCity(),
                request.note(),
                request.items()
        );
        return mapper.toOrderDto(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> listAllOrdersAdmin() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(mapper::toOrderDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderDto> listOrdersByUserIdAdmin(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }
        return orderRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(mapper::toOrderDto)
                .toList();
    }

    @Transactional
    public OrderDto createOrderByAdmin(AdminCreateOrderRequest request, String actorEmail) {
        User targetUser = null;
        if (request.userId() != null) {
            targetUser = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.userId()));
        }
        String source = (request.orderSource() != null && !request.orderSource().isBlank())
                ? request.orderSource().trim().toUpperCase()
                : "INSTAGRAM";
        String status = normalizeStatus(request.status() != null && !request.status().isBlank()
                ? request.status()
                : "CONFIRMED");

        Order saved = createOrderInternal(
                targetUser,
                source,
                normalizePayment(request.paymentMethod()),
                status,
                request.recipientName(),
                request.recipientPhone(),
                request.shippingAddress(),
                request.shippingCity(),
                request.note(),
                request.items()
        );

        auditLogService.record(actorEmail, "ADMIN_ORDER_CREATED", "ORDER", saved.getOrderCode(),
                "Created " + source + " order for " + saved.getRecipientName());
        return mapper.toOrderDto(saved);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, UpdateOrderStatusRequest request, String actorEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        order.setStatus(normalizeStatus(request.status()));
        Order saved = orderRepository.save(order);
        auditLogService.record(actorEmail, "ORDER_STATUS_UPDATED", "ORDER", saved.getOrderCode(),
                "Status updated to " + saved.getStatus());
        return mapper.toOrderDto(saved);
    }

    private Order createOrderInternal(User user,
                                      String source,
                                      String paymentMethod,
                                      String status,
                                      String recipientName,
                                      String recipientPhone,
                                      String shippingAddress,
                                      String shippingCity,
                                      String note,
                                      List<CreateOrderItemRequest> reqItems) {
        long totalVnd = reqItems.stream()
                .mapToLong(item -> item.unitPriceVnd() * item.quantity())
                .sum();

        String orderCode = "LG-" + LocalDate.now().format(ORDER_DATE_FMT) + "-"
                + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .orderSource(source)
                .paymentMethod(paymentMethod)
                .status(status)
                .totalVnd(totalVnd)
                .recipientName(recipientName.trim())
                .recipientPhone(recipientPhone.trim())
                .shippingAddress(shippingAddress.trim())
                .shippingCity(shippingCity != null && !shippingCity.isBlank() ? shippingCity.trim() : null)
                .note(note)
                .build();

        List<OrderItem> items = reqItems.stream()
                .map(reqItem -> mapper.toOrderItemEntity(order, reqItem))
                .toList();
        order.getItems().addAll(items);
        return orderRepository.save(order);
    }

    private void syncUserDefaultsIfEmpty(User user, Order saved) {
        boolean profileUpdated = false;
        if (user.getPhone() == null || user.getPhone().isBlank()) {
            user.setPhone(saved.getRecipientPhone());
            profileUpdated = true;
        }
        if (user.getDefaultAddress() == null || user.getDefaultAddress().isBlank()) {
            user.setDefaultAddress(saved.getShippingAddress());
            profileUpdated = true;
        }
        if ((user.getDefaultCity() == null || user.getDefaultCity().isBlank()) && saved.getShippingCity() != null) {
            user.setDefaultCity(saved.getShippingCity());
            profileUpdated = true;
        }
        if (profileUpdated) {
            userRepository.save(user);
        }
    }

    private String normalizePayment(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return "COD";
        }
        String upper = paymentMethod.trim().toUpperCase();
        return (upper.equals("BANK") || upper.equals("COD")) ? upper : "COD";
    }

    private String normalizeStatus(String status) {
        String upper = status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(upper)) {
            throw new BadRequestException("Invalid order status: " + status);
        }
        return upper;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
