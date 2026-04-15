package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.model.Ticket.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Ticket> findByAssignedToOrderByCreatedAtDesc(String assignedTo);
    List<Ticket> findAllByOrderByCreatedAtDesc();
    List<Ticket> findByStatus(TicketStatus status);
    long countByStatus(TicketStatus status);
    long countByUserId(String userId);
}

