package com.screenwriter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SceneContentRequest {

    @NotNull(message = "Content order is required")
    private Integer contentOrder;

    @NotBlank(message = "Content type is required")
    private String type;

    @Size(max = 10000, message = "Content must not exceed 10000 characters")
    private String content;

    private Long characterId;
}