/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package config;

/**
 *
 * @author pite
 */

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;

public class JwtUtil {

    
  
    
    
    
    private static final String SECRET_KEY = "NJTEventsSecretKeyKojaJeDovoljnoDugacka123!";
    private static final long EXPIRATION_TIME = 1000 * 60 * 30; // 30 min

    private static final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // Generisanje tokena
    public static String generateToken(String email, String rola) {
        return Jwts.builder()
                .setSubject(email)
                .claim("rola", rola)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    public static String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public static String extractRola(String token) {
        return (String) getClaims(token).get("rola");
    }

    public static boolean isTokenValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private static Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
