package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;



@Data
@Builder

@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;

    private ResourceType type;

    private int capacity;

    private String location;

    @Builder.Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    @Builder.Default
    private List<String> availabilityWindows = new ArrayList<>();

    private String description;

}
