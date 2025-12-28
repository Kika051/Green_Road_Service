const PDFDocument = require("pdfkit");

exports.generateInvoice = async (req, res) => {
  // Gérer CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  const data = req.body;

  try {
    // Générer un numéro de facture formaté comme GRS-2025-12-13-2D269
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const randomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const invoiceNumber = `GRS-${dateStr}-${randomId}`;

    const dateEmission = data.date || now.toLocaleDateString("fr-FR");

    const prixTTC = parseFloat(data.price || 0);
    const prixHT = +(prixTTC / 1.1).toFixed(2);
    const tva = +(prixTTC - prixHT).toFixed(2);

    // Formatage des dates amélioré
    const formatDate = (d) => {
      if (!d) return null;
      try {
        let dateObj;

        // Si c'est un timestamp Firestore (objet avec _seconds)
        if (d._seconds) {
          dateObj = new Date(d._seconds * 1000);
        }
        // Si c'est une string ISO ou un timestamp
        else {
          dateObj = new Date(d);
        }

        if (isNaN(dateObj.getTime())) return null;

        return (
          dateObj.toLocaleDateString("fr-FR") +
          " " +
          dateObj.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } catch (e) {
        console.error("Erreur formatDate:", e);
        return null;
      }
    };

    // Date de réservation = date du paiement ou date actuelle si non disponible
    const dateReservation =
      formatDate(data.paymentAt) ||
      formatDate(data.reservationTimestamp) ||
      formatDate(data.createdAt) ||
      now.toLocaleDateString("fr-FR") +
        " " +
        now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    // Date de prise en charge = datetime de la course
    const datePriseEnCharge = formatDate(data.datetime) || "Non précisée";

    // ✅ Fix: Nettoyer les km (enlever "km" si déjà présent dans la valeur)
    let distanceValue = data.kilometers || "?";
    if (typeof distanceValue === "string") {
      distanceValue = distanceValue.replace(/\s*km\s*/gi, "").trim();
    }
    // Si c'est un nombre, on le garde tel quel
    if (typeof distanceValue === "number") {
      distanceValue = distanceValue.toString();
    }

    // ✅ Nom du client (priorité: clientName > name > displayName > email)
    const clientName =
      data.clientName ||
      data.name ||
      data.displayName ||
      data.email ||
      "Client";

    // ✅ Téléphone du client
    const clientPhone = data.phone || "";

    // Créer le PDF
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Buffer pour stocker le PDF
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Facture_GRS_${invoiceNumber}.pdf`,
      });
      res.send(pdfBuffer);
    });

    // === EN-TÊTE ENTREPRISE (gauche) ===
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("GREEN ROAD SERVICES", 50, 50);

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#000")
      .text("SIREN : 932 770 688", 50, 72)
      .text("N° TVA intracommunautaire : FR10 932 770 688", 50, 84)
      .text("Registre VTC : EVTC051240079", 50, 96)
      .text("35 RUE AUGUSTE HUMBERT, 51430 TINQUEUX", 50, 108)
      .text("Chauffeur : Florian Geron", 50, 120)
      .text("Tél : 06 18 71 05 34", 50, 132);

    // === FACTURE INFO (droite) ===
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text(`FACTURE N° ${invoiceNumber}`, 300, 50, {
        align: "right",
        width: 245,
      });

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#000")
      .text(`Date : ${dateEmission}`, 300, 68, { align: "right", width: 245 });

    // === SECTION CLIENT ===
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("Client :", 50, 165);

    // ✅ Afficher nom, téléphone et adresse
    let clientY = 180;
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#000")
      .text(clientName, 50, clientY);

    clientY += 13;
    if (clientPhone) {
      doc.text(`Tél : ${clientPhone}`, 50, clientY);
      clientY += 13;
    }

    doc.text(data.clientAddress || data.pickup || "", 50, clientY);

    // === TABLEAU ===
    const tableTop = 230;
    const tableLeft = 50;
    const rowHeight = 60;
    const headerHeight = 35;

    // Largeurs des colonnes
    const col1Width = 100; // Date réservation
    const col2Width = 100; // Date prise en charge
    const col3Width = 195; // Trajet
    const col4Width = 50; // Distance
    const col5Width = 50; // Prix TTC
    const tableWidth =
      col1Width + col2Width + col3Width + col4Width + col5Width;

    // === EN-TÊTE DU TABLEAU ===
    doc.lineWidth(1).strokeColor("#000");

    // Rectangle en-tête
    doc.rect(tableLeft, tableTop, tableWidth, headerHeight).stroke();

    // Lignes verticales de l'en-tête
    let xLine = tableLeft + col1Width;
    doc
      .moveTo(xLine, tableTop)
      .lineTo(xLine, tableTop + headerHeight)
      .stroke();
    xLine += col2Width;
    doc
      .moveTo(xLine, tableTop)
      .lineTo(xLine, tableTop + headerHeight)
      .stroke();
    xLine += col3Width;
    doc
      .moveTo(xLine, tableTop)
      .lineTo(xLine, tableTop + headerHeight)
      .stroke();
    xLine += col4Width;
    doc
      .moveTo(xLine, tableTop)
      .lineTo(xLine, tableTop + headerHeight)
      .stroke();

    // Texte de l'en-tête
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#000");

    let xPos = tableLeft + 5;
    doc.text("Date et heure de", xPos, tableTop + 8, { width: col1Width - 10 });
    doc.text("réservation", xPos, tableTop + 20, { width: col1Width - 10 });

    xPos = tableLeft + col1Width + 5;
    doc.text("Date et heure de", xPos, tableTop + 8, { width: col2Width - 10 });
    doc.text("prise en charge", xPos, tableTop + 20, { width: col2Width - 10 });

    xPos = tableLeft + col1Width + col2Width + 5;
    doc.text("Trajet", xPos, tableTop + 13, { width: col3Width - 10 });

    xPos = tableLeft + col1Width + col2Width + col3Width + 5;
    doc.text("Distance", xPos, tableTop + 13, { width: col4Width - 10 });

    xPos = tableLeft + col1Width + col2Width + col3Width + col4Width + 5;
    doc.text("Prix TTC", xPos, tableTop + 13, { width: col5Width - 10 });

    // === LIGNE DE DONNÉES ===
    const dataTop = tableTop + headerHeight;

    // Rectangle données
    doc.rect(tableLeft, dataTop, tableWidth, rowHeight).stroke();

    // Lignes verticales des données
    xLine = tableLeft + col1Width;
    doc
      .moveTo(xLine, dataTop)
      .lineTo(xLine, dataTop + rowHeight)
      .stroke();
    xLine += col2Width;
    doc
      .moveTo(xLine, dataTop)
      .lineTo(xLine, dataTop + rowHeight)
      .stroke();
    xLine += col3Width;
    doc
      .moveTo(xLine, dataTop)
      .lineTo(xLine, dataTop + rowHeight)
      .stroke();
    xLine += col4Width;
    doc
      .moveTo(xLine, dataTop)
      .lineTo(xLine, dataTop + rowHeight)
      .stroke();

    // Données
    doc.fontSize(9).font("Helvetica").fillColor("#000");

    xPos = tableLeft + 5;
    doc.text(dateReservation, xPos, dataTop + 20, { width: col1Width - 10 });

    xPos = tableLeft + col1Width + 5;
    doc.text(datePriseEnCharge, xPos, dataTop + 20, { width: col2Width - 10 });

    // Trajet avec flèche dessinée graphiquement
    xPos = tableLeft + col1Width + col2Width + 5;
    doc.text(`${data.pickup || "?"}`, xPos, dataTop + 8, {
      width: col3Width - 10,
    });

    // Dessiner une flèche graphiquement
    const arrowY = dataTop + 28;
    const arrowStartX = xPos;
    const arrowEndX = xPos + 20;

    doc.lineWidth(1).strokeColor("#000");
    // Ligne horizontale
    doc.moveTo(arrowStartX, arrowY).lineTo(arrowEndX, arrowY).stroke();
    // Pointe de la flèche
    doc
      .moveTo(arrowEndX - 4, arrowY - 3)
      .lineTo(arrowEndX, arrowY)
      .lineTo(arrowEndX - 4, arrowY + 3)
      .stroke();

    doc.text(`${data.dropoff || "?"}`, xPos, dataTop + 38, {
      width: col3Width - 10,
    });

    // ✅ Fix: afficher distance sans doublon "km"
    xPos = tableLeft + col1Width + col2Width + col3Width + 5;
    doc.text(`${distanceValue} km`, xPos, dataTop + 20, {
      width: col4Width - 10,
    });

    xPos = tableLeft + col1Width + col2Width + col3Width + col4Width + 5;
    doc.text(`${prixTTC.toFixed(2)} €`, xPos, dataTop + 20, {
      width: col5Width - 10,
    });

    // === TOTAUX (alignés à gauche comme le modèle) ===
    const totalsTop = dataTop + rowHeight + 25;

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#000")
      .text(`Montant HT : ${prixHT.toFixed(2)} €`, 50, totalsTop)
      .text(`TVA (10%) : ${tva.toFixed(2)} €`, 50, totalsTop + 15);

    doc
      .font("Helvetica-Bold")
      .text(`Total TTC : ${prixTTC.toFixed(2)} €`, 50, totalsTop + 32);

    doc
      .font("Helvetica")
      .text("Moyen de paiement : Carte bancaire", 50, totalsTop + 50);

    // === FOOTER (en bas de page, en italique) ===
    doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .fillColor("#000")
      .text(
        "TVA sur les transports de voyageurs selon l'article 279 du CGI.",
        50,
        720
      )
      .text("Paiement comptant. Merci pour votre confiance.", 50, 732)
      .text("Document à conserver pendant 10 ans (Code du commerce).", 50, 744);

    // Finaliser le PDF
    doc.end();
  } catch (err) {
    console.error("❌ Erreur génération PDF :", err);
    return res
      .status(500)
      .json({ error: "Erreur lors de la génération de la facture." });
  }
};
