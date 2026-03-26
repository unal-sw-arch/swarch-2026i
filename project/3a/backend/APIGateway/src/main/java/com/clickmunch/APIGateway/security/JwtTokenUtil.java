package com.clickmunch.APIGateway.security;

import io.jsonwebtoken.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenUtil.class);

    private static final String SecretKey = "1245789630ClickAndMunchSuperSecretKey1245789630";

    public String generateToken(String username, String role) {
        logger.info("Generating token for username {} and role {}", username, role);
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600_000))
                .signWith(SignatureAlgorithm.HS256, SecretKey)
                .compact();
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SecretKey)
                .parseClaimsJws(token)
                .getBody();
    }


    public String extractUsername(String token) {
        try {
            return getClaims(token).getSubject();
        } catch (Exception e) {
            logger.error("Error extracting username from token: {}", e.getMessage());
            return null;
        }
    }

    public boolean isTokenValid(String token) {
        try{
            getClaims(token);
            return true;
        }
        catch (ExpiredJwtException e){
            logger.warn("Token expired: {}", e.getMessage());
            return false;
        }
        catch (UnsupportedJwtException e){
            logger.warn("Unsupported JWT: {}", e.getMessage());
            return false;
        }
        catch (MalformedJwtException e){
            logger.warn("Malformed JWT: {}", e.getMessage());
            return false;
        }
        catch (IllegalArgumentException e){
            logger.warn("Illegal argument: {}", e.getMessage());
            return false;
        }
        catch (Exception e){
            logger.error("Invalid token: {}", e.getMessage());
            return false;
        }

    }

    public String generateResetToken(String username) {
        logger.info("Generating reset token for username {}", username);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600_000))
                .signWith(SignatureAlgorithm.HS256, SecretKey)
                .compact();
    }
}
