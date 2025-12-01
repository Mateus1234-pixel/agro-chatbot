package br.com.banco.login;

public class LoginResponse {
    private Long id;
    private String nome;
    private String email;
    private String message;

    public LoginResponse(Long id, String nome, String email, String message) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.message = message;
    }

    // getters
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getMessage() { return message; }
}
