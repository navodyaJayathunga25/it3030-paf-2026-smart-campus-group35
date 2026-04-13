package com.smartcampus.repository;

import com.smartcampus.model.Ticket;


import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByReportedBy(String reportedBy);

    List<Ticket> findByReportedByAndStatus(String reportedBy, Ticket.TicketStatus status);

    List<Ticket> findByReportedByAndPriority(String reportedBy, Ticket.Priority priority);

}
