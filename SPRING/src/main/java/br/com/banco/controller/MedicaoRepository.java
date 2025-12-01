package br.com.banco.controller;

import br.com.banco.model.Medicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicaoRepository extends JpaRepository<Medicao, Long> {

    @Query("SELECT m FROM Medicao m ORDER BY m.medicaoEm DESC")
    List<Medicao> findAllOrderByMedicaoEmDesc();

    @Query("SELECT m FROM Medicao m WHERE m.usuario.id = :usuarioId ORDER BY m.medicaoEm DESC")
    List<Medicao> findByUsuarioIdOrderByMedicaoEmDesc(@Param("usuarioId") Long usuarioId);
}
