package br.com.banco.controller;

import br.com.banco.model.Medicao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/backend")
@CrossOrigin(origins = "http://localhost:3000")
public class HistoricoController {

    @Autowired
    private MedicaoRepository medicaoRepository;

    @GetMapping("/historico.php")
    public List<Medicao> getHistorico(@RequestParam("usuarioId") Long usuarioId) {
        return medicaoRepository.findByUsuarioIdOrderByMedicaoEmDesc(usuarioId);
    }
}
