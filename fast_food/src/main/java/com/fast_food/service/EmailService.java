package com.fast_food.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void envoyerMailVerification(String emailDestinataire, String token) {
        String lien = "http://localhost:8080/api/auth/verify?token=" + token;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(emailDestinataire);
            helper.setSubject("Activation de votre compte Fast Food");
            
            String contenuHtml = "<h2>Bienvenue !</h2>"
                    + "<p>Merci de vous être inscrit. Cliquez sur le lien ci-dessous pour activer votre compte :</p>"
                    + "<a href=\"" + lien + "\" style=\"background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; display: inline-block; border-radius: 5px;\">Activer mon compte</a>"
                    + "<br><br><p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>" + lien + "</p>";

            helper.setText(contenuHtml, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Échec de l'envoi de l'e-mail de vérification", e);
        }
    }
}