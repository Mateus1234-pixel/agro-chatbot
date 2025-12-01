package br.com.banco.controller;

import br.com.banco.model.Medicao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicoes")
@CrossOrigin(origins = "http://localhost:3000") // Permitir requisições do frontend
public class MedicaoController {

    @Autowired
    private MedicaoRepository medicaoRepository;

    @GetMapping
    public List<Medicao> getMedicoes() {
        return medicaoRepository.findAllOrderByMedicaoEmDesc();
    }

    @PostMapping
public Medicao salvarMedicao(@RequestBody Medicao medicao) {
    return medicaoRepository.save(medicao);
}
}
