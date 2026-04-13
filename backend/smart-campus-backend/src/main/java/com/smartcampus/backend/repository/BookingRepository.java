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

}
