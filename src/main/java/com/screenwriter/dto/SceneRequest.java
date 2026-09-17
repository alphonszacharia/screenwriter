package com.screenwriter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.util.List;
@Getter
@Setter
public class SceneRequest {

    @NotBlank(message = "Scene name is required")
    @Size(max = 255, message = "Scene name must not exceed 255 characters")
    private String sceneName;

    @NotBlank(message = "Scene heading is required")
    @Size(max = 255, message = "Scene heading must not exceed 255 characters")
    private String heading;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    private List<Long> characterIds;
}