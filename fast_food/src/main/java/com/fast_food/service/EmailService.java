package com.fast_food.service;

import java.math.BigDecimal;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.fast_food.entite.Commande;
import com.fast_food.entite.CommandeMenu;

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

    @Async
    public void envoyerRecuCommande(Commande commande) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(commande.getUser().getEmail());
            helper.setSubject("Confirmation de votre commande #" + commande.getId());

            StringBuilder sb = new StringBuilder();
            sb.append("<h2>Merci pour votre commande !</h2>");
            sb.append("<p>Numéro de commande : <strong>#").append(commande.getId()).append("</strong></p>");
            sb.append("<p>Adresse de livraison : ").append(commande.getCpRue()).append(", ")
            .append(commande.getCpCodePostal()).append(" ").append(commande.getCpVille()).append("</p>");
            
            sb.append("<h3>Détails de la commande :</h3><ul>");
            for (CommandeMenu item : commande.getCommandeProduits()) {
                sb.append("<li>")
                .append(item.getQuantite()).append("x ")
                .append(item.getProduitMenu().getNom())
                .append(" — ").append(item.getPrix().multiply(BigDecimal.valueOf(item.getQuantite()))).append(" €")
                .append("</li>");
            }
            sb.append("</ul>");
            sb.append("<h3>Total : ").append(commande.getTotal()).append(" €</h3>");

            helper.setText(sb.toString(), true);
            mailSender.send(message);

        } catch (MessagingException e) {
            // Optionnel : logger l'erreur sans bloquer la réponse de la commande
            System.err.println("Échec de l'envoi de la confirmation de commande : " + e.getMessage());
        }
    }
}