package dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email; // Peut contenir email ou username
    private String password;
}
