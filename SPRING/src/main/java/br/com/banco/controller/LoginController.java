package br.com.banco.controller;

import br.com.banco.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/banco/usuarios")
@CrossOrigin(origins = "http://localhost:3000") // libera requisições do seu frontend
public class LoginController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String usuario = body.get("usuario");
        String senha = body.get("senha");

        Usuario user = usuarioRepository.findByUsuario(usuario);

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Usuário não encontrado"));
        }

        if (!passwordEncoder.matches(senha, user.getSenha())) {
            return ResponseEntity.status(401).body(Map.of("message", "Senha inválida"));
        }

        // Se chegou até aqui, login válido
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("nome", user.getNome());
        response.put("usuario", user.getUsuario());
        response.put("message", "Login realizado com sucesso!");

        return ResponseEntity.ok(response);
    }
}
