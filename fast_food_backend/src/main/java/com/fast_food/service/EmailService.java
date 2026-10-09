package com.fast_food.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.fast_food.entite.Commande;
import com.fast_food.entite.CommandeItemOption;
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
            
            if (commande.getTypeRetrait() == Commande.TypeRetrait.livraison) {
                sb.append("<p>Mode de retrait : <strong>Livraison</strong><br>")
                .append("Adresse : ").append(commande.getCpRue()).append(", ")
                .append(commande.getCpCodePostal()).append(" ").append(commande.getCpVille()).append("</p>");
            } else {
                sb.append("<p>Mode de retrait : <strong>Click & Collect (Retrait en restaurant)</strong></p>");
            }

            sb.append("<h3>Détails de la commande :</h3><ul>");
            for (CommandeMenu item : commande.getCommandeProduits()) {
                if (item.getParent() != null) {
                    continue;
                }

                BigDecimal prixUnitaire = item.getPrix();
                if (item.getComposants() != null) {
                    for (CommandeMenu composant : item.getComposants()) {
                        prixUnitaire = prixUnitaire.add(composant.getPrix());
                    }
                }

                sb.append("<li>")
                .append("<strong>").append(item.getQuantite()).append("x ")
                .append(item.getProduitMenu().getNom()).append("</strong>")
                .append(" — ").append(prixUnitaire.multiply(BigDecimal.valueOf(item.getQuantite()))).append(" €");

                ajouterOptionsHtml(sb, item);

                // Composition de la formule
                if (item.getComposants() != null && !item.getComposants().isEmpty()) {
                    sb.append("<ul style=\"font-size: 0.9em; color: #555;\">");
                    for (CommandeMenu composant : item.getComposants()) {
                        sb.append("<li>");
                        if (composant.getFormuleGroupe() != null) {
                            sb.append(composant.getFormuleGroupe().getNom()).append(" : ");
                        }
                        sb.append(composant.getProduitMenu().getNom());

                        BigDecimal supplement = calculerSupplementEmplacement(composant);
                        if (supplement.compareTo(BigDecimal.ZERO) > 0) {
                            sb.append(" (+").append(supplement).append(" €)");
                        }

                        ajouterOptionsHtml(sb, composant);
                        sb.append("</li>");
                    }
                    sb.append("</ul>");
                }

                sb.append("</li>");
            }
            sb.append("</ul>");
            sb.append("<h3>Total : ").append(commande.getTotal()).append(" €</h3>");

            helper.setText(sb.toString(), true);
            mailSender.send(message);

        } catch (MessagingException e) {
            System.err.println("Échec de l'envoi de la confirmation de commande : " + e.getMessage());
        }
    }

    // Ajoute la liste des options / suppléments d'une ligne de commande
    private void ajouterOptionsHtml(StringBuilder sb, CommandeMenu ligne) {
        if (ligne.getOptions() == null || ligne.getOptions().isEmpty()) {
            return;
        }

        List<String> detailsOptions = new ArrayList<>();
        for (CommandeItemOption opt : ligne.getOptions()) {
            String nom = opt.getNomOption() != null ? opt.getNomOption()
                    : (opt.getOptionItem() != null ? opt.getOptionItem().getNom() : "");

            if (opt.getSurcout() != null && opt.getSurcout().compareTo(BigDecimal.ZERO) > 0) {
                nom += " (+" + opt.getSurcout() + " €)";
            }
            if (!nom.isBlank()) {
                detailsOptions.add(nom);
            }
        }

        if (!detailsOptions.isEmpty()) {
            sb.append("<br><span style=\"font-size: 0.9em; color: #555;\">Options : ")
            .append(String.join(", ", detailsOptions))
            .append("</span>");
        }
    }

    // Supplément lié à l'emplacement d'une formule (prix de la ligne enfant sans les surcoûts des options)
    private BigDecimal calculerSupplementEmplacement(CommandeMenu composant) {
        BigDecimal supplement = composant.getPrix() != null ? composant.getPrix() : BigDecimal.ZERO;
        if (composant.getOptions() != null) {
            for (CommandeItemOption opt : composant.getOptions()) {
                if (opt.getSurcout() != null) {
                    supplement = supplement.subtract(opt.getSurcout());
                }
            }
        }
        return supplement;
    }

    @Async
    public void envoyerMailChangementStatut(Commande commande) {
        if (commande.getUser() == null || commande.getUser().getEmail() == null) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(commande.getUser().getEmail());
            
            String sujet = "";
            String contenuHtml = "";

            // Personnalisation selon le type de retrait et le statut
            if (commande.getTypeRetrait() == Commande.TypeRetrait.click_and_collect) {
                sujet = "Votre commande #" + commande.getId() + " est prête !";
                contenuHtml = "<h2>Bonne nouvelle !</h2>"
                        + "<p>Votre commande en <strong>Click & Collect</strong> numéro <strong>#" + commande.getId() + "</strong> est désormais <strong>prête à être récupérée</strong> en restaurant.</p>"
                        + "<p>À très bientôt chez Fast Food !</p>";
            } else if (commande.getTypeRetrait() == Commande.TypeRetrait.livraison) {
                sujet = "Votre commande #" + commande.getId() + " est en cours de livraison !";
                contenuHtml = "<h2>Livraison de votre commande en cours !</h2>"
                        + "<p>Votre commande numéro <strong>#" + commande.getId() + "</strong>. est en cours de livraison a votre adresse suivante: </p>"
                        + "<p>" + commande.getCpRue() + ", " + commande.getCpCodePostal() + " " + commande.getCpVille() + "</p>";
            }

            if (!sujet.isEmpty()) {
                helper.setSubject(sujet);
                helper.setText(contenuHtml, true);
                mailSender.send(message);
            }

        } catch (MessagingException e) {
            System.err.println("Échec de l'envoi de l'e-mail de statut pour la commande #" + commande.getId() + " : " + e.getMessage());
        }
    }
}