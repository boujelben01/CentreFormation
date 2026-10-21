package controller.api;

import dto.AuthResponse;
import dto.MessageResponse;
import dto.LoginRequest;
import dto.RegisterRequest;
import dto.RegisterResponse;
import entity.Etudiant;
import entity.Role;
import entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import repository.EtudiantRepository;
import repository.RoleRepository;
import repository.UserRepository;
import security.JwtUtil;
import security.UserDetailsServiceImpl;
import service.admin.EmailService;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthApiController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Authenticate user with email
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            // Load user details by email
            UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());

            // Generate JWT token
            String token = jwtUtil.generateToken(userDetails);

            // Extract role
            String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_USER");

            // Return response with token (username field in response contains email)
            AuthResponse response = new AuthResponse(token, userDetails.getUsername(), role);
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("E-mail ou mot de passe incorrect."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Une erreur est survenue lors de l'authentification."));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            // Validate input
            if (registerRequest.getUsername() == null || registerRequest.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Le nom d'utilisateur est obligatoire."));
            }
            if (registerRequest.getPassword() == null || registerRequest.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Le mot de passe est obligatoire."));
            }
            if (registerRequest.getUserType() == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Le type d'utilisateur est obligatoire."));
            }

            // Check if username already exists
            if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new MessageResponse("Ce nom d'utilisateur existe déjà."));
            }

            // Determine user type and create appropriate entity
            User newUser;
            String userType = registerRequest.getUserType().toUpperCase();
            Role.RoleName roleName;

            if ("ETUDIANT".equals(userType)) {
                // Validate etudiant-specific fields
                if (registerRequest.getMatricule() == null || registerRequest.getMatricule().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Le matricule est obligatoire pour un étudiant."));
                }

                // Check if matricule already exists
                if (etudiantRepository.findByMatricule(registerRequest.getMatricule()).isPresent()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new MessageResponse("Ce matricule existe déjà."));
                }

                Etudiant etudiant = new Etudiant();
                etudiant.setUsername(registerRequest.getUsername());
                etudiant.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
                etudiant.setMatricule(registerRequest.getMatricule());
                etudiant.setNom(registerRequest.getNom());
                etudiant.setPrenom(registerRequest.getPrenom());
                etudiant.setEmail(registerRequest.getEmail());
                etudiant.setDateInscription(LocalDate.now());
                etudiant.setDateCreation(LocalDate.now());
                etudiant.setEnabled(true);

                roleName = Role.RoleName.ETUDIANT;
                newUser = etudiant;

            } else if ("FORMATEUR".equals(userType)) {
                // Les comptes formateur ne se créent jamais en libre-service : ils sont créés par l'administration.
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("L'inscription en ligne est réservée aux étudiants : les comptes formateur sont créés par l'administration."));

            } else {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Type d'utilisateur invalide : seule l'inscription d'un étudiant est possible."));
            }

            // Assign role
            Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Rôle introuvable : " + roleName));
            
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            newUser.setRoles(roles);

            // Save user
            User savedUser = userRepository.save(newUser);

            // Envoyer l'email de bienvenue pour les étudiants
            if ("ETUDIANT".equals(userType)) {
                Etudiant etudiant = (Etudiant) savedUser;
                String groupeName = etudiant.getGroupe() != null ? etudiant.getGroupe().getNom() : "Non affecté";
                
                try {
                    emailService.sendWelcomeEmailToStudent(
                        etudiant.getEmail(),
                        etudiant.getPrenom() + " " + etudiant.getNom(),
                        etudiant.getMatricule(),
                        groupeName
                    );
                } catch (Exception e) {
                    // Log l'erreur mais ne bloque pas l'inscription
                    System.err.println("Erreur lors de l'envoi de l'email de bienvenue: " + e.getMessage());
                }
            }

            // Return success response
            RegisterResponse response = new RegisterResponse(
                "Compte créé avec succès.",
                savedUser.getUsername(),
                userType,
                savedUser.getId()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Une erreur est survenue lors de la création du compte."));
        }
    }
}
