package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByUserIdAndStatus(String userId, Booking.BookingStatus status);

    List<Booking> findByStatus(Booking.BookingStatus status);

    List<Booking> findByResourceId(String resourceId);

    @Query("{ 'resourceId': ?0, 'status': { $nin: ['CANCELLED', 'REJECTED'] }, 'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } }")
    List<Booking> findOverlappingBookings(String resourceId, Instant startTime, Instant endTime);

    @Query("{ 'resourceId': ?0, 'status': { $nin: ['CANCELLED', 'REJECTED'] }, 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 }, '_id': { $ne: ?1 } }")
    List<Booking> findOverlappingBookingsExcluding(String resourceId, String excludeBookingId, Instant startTime, Instant endTime);
}