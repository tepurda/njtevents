package config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session
                .sessionCreationPolicy(
                        org.springframework.security.config.http.SessionCreationPolicy.STATELESS
                )
                )
                .addFilterBefore(new JwtFilter(), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/administratori").permitAll()
                // Korisnik vidi samo svoje zahteve 
                .requestMatchers(HttpMethod.GET, "/api/zahtevi/moji/**").authenticated()
                // Kreiranje rezervacije od strane administratora 
                .requestMatchers(HttpMethod.POST, "/api/rezervacije/admin").hasAuthority("ROLE_ADMINISTRATOR")
                // Kreiranje rezervacije — svi ulogovani
                .requestMatchers(HttpMethod.POST, "/api/rezervacije").authenticated()
                // Gantov dijagram — svi ulogovani
                .requestMatchers(HttpMethod.GET, "/api/rezervacije/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/sale/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/tipovisale/**").authenticated()
                // Upravljanje salama — samo administrator
                .requestMatchers(HttpMethod.POST, "/api/sale").hasAuthority("ROLE_ADMINISTRATOR")
                .requestMatchers(HttpMethod.PUT, "/api/sale/**").hasAuthority("ROLE_ADMINISTRATOR")
                .requestMatchers(HttpMethod.DELETE, "/api/sale/**").hasAuthority("ROLE_ADMINISTRATOR")
                // Upravljanje tipovima sale — samo administrator
                .requestMatchers(HttpMethod.POST, "/api/tipovisale").hasAuthority("ROLE_ADMINISTRATOR")
                .requestMatchers(HttpMethod.PUT, "/api/tipovisale/**").hasAuthority("ROLE_ADMINISTRATOR")
                .requestMatchers(HttpMethod.DELETE, "/api/tipovisale/**").hasAuthority("ROLE_ADMINISTRATOR")
                // Obrada zahteva — samo administrator
                .requestMatchers("/api/zahtevi/**").hasAuthority("ROLE_ADMINISTRATOR")
                // Kreiranje korisnika — samo administrator
                .requestMatchers(HttpMethod.POST, "/api/korisnici").hasAuthority("ROLE_ADMINISTRATOR")
                .requestMatchers(HttpMethod.DELETE, "/api/korisnici/**").hasAuthority("ROLE_ADMINISTRATOR")
                // Promena sopstvene šifre — samo korisnik (mora biti pre opšteg PUT /api/korisnici/**)
                .requestMatchers(HttpMethod.PUT, "/api/korisnici/me/sifra").hasAuthority("ROLE_KORISNIK")
                // Sve ostalo — samo administrator
                .anyRequest().hasAuthority("ROLE_ADMINISTRATOR")
                );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Dozvoli zahteve sa React frontenda
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));

        // Dozvoli sve HTTP metode
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Dozvoli sve headere
        configuration.setAllowedHeaders(List.of("*"));

        // Dozvoli slanje kredencijala (token)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
