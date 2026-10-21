package controller.api;

import entity.Etudiant;
import entity.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import repository.EtudiantRepository;
import repository.RoleRepository;
import repository.UserRepository;
import service.admin.EmailService;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Inscription publique : réservée aux étudiants, messages en français. */
@ExtendWith(MockitoExtension.class)
class AuthApiControllerTest {

    @Mock private UserRepository userRepository;
    @Mock private EtudiantRepository etudiantRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;
    @InjectMocks private AuthApiController controller;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(controller).build();
        lenient().when(passwordEncoder.encode(any())).thenReturn("hash");
    }

    private static final String FORMATEUR_BODY =
            "{\"username\":\"pirate\",\"password\":\"secret123\",\"userType\":\"FORMATEUR\",\"nom\":\"X\",\"prenom\":\"Y\",\"email\":\"pirate@example.com\"}";

    @Test
    void inscriptionFormateur_refusee_403_et_aucun_compte_cree() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(FORMATEUR_BODY))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(
                        "L'inscription en ligne est réservée aux étudiants : les comptes formateur sont créés par l'administration."));
        verify(userRepository, never()).save(any());
    }

    @Test
    void inscriptionFormateur_refusee_meme_en_minuscules() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(FORMATEUR_BODY.replace("FORMATEUR", "formateur")))
                .andExpect(status().isForbidden());
        verify(userRepository, never()).save(any());
    }

    @Test
    void typeInconnu_400_en_francais() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(FORMATEUR_BODY.replace("FORMATEUR", "ADMIN")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Type d'utilisateur invalide : seule l'inscription d'un étudiant est possible."));
        verify(userRepository, never()).save(any());
    }

    @Test
    void inscriptionEtudiant_valide_201() throws Exception {
        Role role = new Role();
        role.setName(Role.RoleName.ETUDIANT);
        when(userRepository.findByUsername("amira")).thenReturn(Optional.empty());
        when(etudiantRepository.findByMatricule("ETU1")).thenReturn(Optional.empty());
        when(roleRepository.findByName(Role.RoleName.ETUDIANT)).thenReturn(Optional.of(role));
        when(userRepository.save(any())).thenAnswer(inv -> {
            Etudiant e = inv.getArgument(0);
            e.setId(5L);
            return e;
        });

        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"amira\",\"password\":\"secret123\",\"userType\":\"ETUDIANT\",\"matricule\":\"ETU1\",\"nom\":\"B\",\"prenom\":\"A\",\"email\":\"amira@example.com\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userType").value("ETUDIANT"))
                .andExpect(jsonPath("$.message").value("Compte créé avec succès."));
    }
}
