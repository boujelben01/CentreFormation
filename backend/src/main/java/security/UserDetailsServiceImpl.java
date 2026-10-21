package security;

import entity.Etudiant;
import entity.Formateur;
import entity.User;
import repository.EtudiantRepository;
import repository.FormateurRepository;
import repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EtudiantRepository etudiantRepository;
    
    @Autowired
    private FormateurRepository formateurRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = null;
        String identifier = null;
        
        // D'abord, essayer de trouver par username (pour les admins et le login web)
        Optional<User> userByUsername = userRepository.findByUsername(usernameOrEmail);
        if (userByUsername.isPresent()) {
            user = userByUsername.get();
            identifier = user.getUsername();
        } else {
            // Sinon, essayer de trouver par email dans Etudiant
            Optional<Etudiant> etudiant = etudiantRepository.findByEmail(usernameOrEmail);
            if (etudiant.isPresent()) {
                user = etudiant.get();
                identifier = etudiant.get().getEmail();
            } else {
                // Sinon, essayer de trouver par email dans Formateur
                Optional<Formateur> formateur = formateurRepository.findByEmail(usernameOrEmail);
                if (formateur.isPresent()) {
                    user = formateur.get();
                    identifier = formateur.get().getEmail();
                } else {
                    throw new UsernameNotFoundException("User not found: " + usernameOrEmail);
                }
            }
        }
        
        Set<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().name()))
                .collect(Collectors.toSet());
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(identifier)
                .password(user.getPassword())
                .authorities(authorities)
                .accountLocked(!user.isEnabled())
                .disabled(!user.isEnabled())
                .build();
    }
}
