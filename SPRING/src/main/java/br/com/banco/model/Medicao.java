package br.com.banco.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicoes")
@Getter
@Setter
public class Medicao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    

    @Column(name = "medicao_em", updatable = false)
private LocalDateTime medicaoEm;

    private String cidade;
private String estado;
private Double temperaturaAr;
private Double umidadeAr;
private Double phSolo;
private Double umidadeSolo;
private Double nitrogenio;
private Double fosforo;
private Double potassio;
private String precipitacao;
private String velocidadeVento;
private String direcaoVento;
private Double temperaturaSolo;

@ManyToOne
@JoinColumn(name = "usuario_id", nullable = false)
private Usuario usuario;

    
    @PrePersist
protected void onCreate() {
    this.medicaoEm = LocalDateTime.now();
}
}
