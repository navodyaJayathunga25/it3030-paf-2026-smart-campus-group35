package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.Booking.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByResourceIdAndDateAndStatus(String resourceId, LocalDate date, BookingStatus status);

    // Check for overlapping bookings (conflict detection)
    @Query("{ 'resourceId': ?0, 'date': ?1, 'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "$or: [ " +
           "  { 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } } " +
           "] }")
    List<Booking> findConflictingBookings(String resourceId, LocalDate date,
                                           LocalTime startTime, LocalTime endTime);

    long countByUserIdAndStatus(String userId, BookingStatus status);

    long countByStatus(BookingStatus status);
}
