package com.apml.portal

import android.content.Context
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private data class QuoteLine(var label: String, var amount: String)
private data class QuoteProfile(
    val company: String, val cin: String, val gstLabel: String, val gst: String,
    val docLabel: String, val doc: String, val addressLabel: String, val address: String,
    val phone: String, val email: String, val showEmail: Boolean, val defaultGst: String,
    val lines: List<QuoteLine>, val terms: List<String>, val percentages: Map<String, Int>
)

private fun quoteProfile(maxcare: Boolean) = if (maxcare) QuoteProfile(
    "Maxcare Packers and Movers Pvt Ltd", "CIN: U63090DL2009PTC196378", "GSTN (ours)", "07AAICM9877E1ZX",
    "Reference No.", "MAX202526954", "Regd. office", "308, Neelkanth Plaza, Pitampura Community Centre, New Delhi-110034",
    "9311204263", "maxcaremoverspvtltd@gmail.com", true, "0",
    listOf(QuoteLine("Transportation Cost","0"), QuoteLine("Packing + Loading + Unloading + Unpacking","0"), QuoteLine("Car Transportation (if any)","0"), QuoteLine("Toll Tax + Risk Cover + Misc. Cost","0")),
    listOf(
        "Please note that lorry transportation charges without quotes are the present prevailing rates and will be charged on actuals at the time of transportation. Extra charges will be charged extra as actual.",
        "The carrier or agent shall be exempted from any loss or damage through accident, pilferage, fire, rain, collision or any other road-driven hazard; we therefore recommend that goods be insured covering risk. While on carrier risk, no individual policy/receipt from the insurance co. will be given.",
        "We would request you to please pay 25% of all charges in advance along with your order, and the balance charges on completion of the packing. For insurance, the full amount of the premium value is to be paid at the packing location before departure of the consignment.",
        "Please note that the above quotation has been prepared keeping in view our basic standards of packing with the best packing material, as the type of packing will depend on our discretion.",
        "We would be grateful if you could please give us one week's advance notice as to when we may commence the above job. Payment will be done in favor of M/S Max Care Packers & Movers Pvt. Ltd."
    ),
    mapOf("transportation cost" to 60, "packing + loading + unloading + unpacking" to 25, "toll tax + risk cover + misc. cost" to 15)
) else QuoteProfile(
    "Exact Container Logistics", "CIN : U74899DL2000PTC107846", "GST No. (ours)", "23AAACL1838J1ZO",
    "Estimate No.", "2025323429", "Registered address", "7737/XV RAM NAGAR QUTUB ROAD, PAHARGANJ NEW DELHI 110063",
    "9667724226", "", false, "0",
    listOf(QuoteLine("Freight","0"), QuoteLine("Car Freight","0"), QuoteLine("Packing Charges","0"), QuoteLine("Loading Charges at Origin","0"), QuoteLine("Unloading Charges at Destination","0"), QuoteLine("Unpacking Charges","0"), QuoteLine("Other Charges (Toll etc.)","0")),
    listOf(
        "Please keep your cash / jewelry in your custody.",
        "Carrying liquor, gas cylinder, acid or any type of liquid/explosive and illegal items is prohibited.",
        "Minimum 15 litres of fuel should be available in the car to run up to the car carrier point and the same way from the car carrier point to the destination.",
        "We don't undertake electrical, carpentry & plumbing work. It can be provided depending on availability and charged accordingly.",
        "If there is any extra packing of any article, or an article outside the article list, it will be charged accordingly.",
        "Extra services provided other than mentioned will be charged accordingly.",
        "20% of the amount to be paid in advance along with the work order and the balance amount on completion of work at the loading point.",
        "Payment in cash/cheque/draft should be in favor of Exact Container Logistics (P) Ltd.",
        "In case of carrier risk, no individual policy / receipt from the insurance company will be given.",
        "In case of monsoon / rainy season / foggy weather / riots / vehicle breakdown / any other natural calamity, 7 extra days will be added to the transit time.",
        "No responsibility on the breakage of flower pots.",
        "This quotation is valid for 15 days."
    ),
    mapOf("freight" to 60, "packing charges" to 20, "loading charges at origin" to 10, "unloading charges at destination" to 5, "unpacking charges" to 3, "other charges (toll etc.)" to 2)
)

private fun money(v: Double) = NumberFormat.getNumberInstance(Locale("en","IN")).apply { minimumFractionDigits=2; maximumFractionDigits=2 }.format(v)

@Composable
fun NativeQuotationScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    var maxcare by remember { mutableStateOf(false) }
    val profile = remember(maxcare) { quoteProfile(maxcare) }
    var date by remember { mutableStateOf(SimpleDateFormat("d MMM yyyy", Locale.ENGLISH).format(Date())) }
    var customer by remember { mutableStateOf("") }
    var customerCompany by remember { mutableStateOf("Unregistered") }
    var customerGst by remember { mutableStateOf("GST Exempted") }
    var from by remember { mutableStateOf("") }
    var to by remember { mutableStateOf("") }
    var doc by remember(maxcare) { mutableStateOf(profile.doc) }
    var ourGst by remember(maxcare) { mutableStateOf(profile.gst) }
    var gstPercent by remember(maxcare) { mutableStateOf("0") }
    var carFreight by remember { mutableStateOf("0") }
    var quickTotal by remember { mutableStateOf("") }
    var lines by remember(maxcare) { mutableStateOf(profile.lines.map { it.copy() }) }
    var terms by remember(maxcare) { mutableStateOf(profile.terms) }
    var status by remember { mutableStateOf("") }
    val subtotal = lines.sumOf { it.amount.toDoubleOrNull() ?: 0.0 }
    val gst = subtotal * (gstPercent.toDoubleOrNull() ?: 0.0) / 100.0
    val grand = subtotal + gst

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        TextButton(onClick = onBack) { Text("← Workspace") }
        Text("Quotation Studio", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text("Create customer quotations for either APML company.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(selected = !maxcare, onClick = { maxcare = false }, label = { Text("Exact Container") })
            FilterChip(selected = maxcare, onClick = { maxcare = true }, label = { Text("Maxcare") })
        }
        QuoteSection("Customer & movement details") {
            QuoteField("Date", date) { date = it }
            QuoteField("Customer name *", customer) { customer = it }
            QuoteField("Customer company", customerCompany) { customerCompany = it }
            QuoteField("Customer GST", customerGst) { customerGst = it }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(Modifier.weight(1f)) { QuoteField("Moving from *", from) { from = it } }
                Box(Modifier.weight(1f)) { QuoteField("Moving to *", to) { to = it } }
            }
        }
        QuoteSection("Document details") {
            QuoteField(profile.docLabel, doc) { doc = it }
            QuoteField(profile.gstLabel, ourGst) { ourGst = it }
            QuoteField("GST percentage", gstPercent, KeyboardType.Decimal) { gstPercent = it }
        }
        QuoteSection("Instant pricing") {
            QuoteField("Total amount to split (₹)", quickTotal, KeyboardType.Decimal) { quickTotal = it }
            Button(onClick = {
                val total = quickTotal.toDoubleOrNull() ?: 0.0
                if (total > 0) {
                    var assigned = 0.0
                    val eligible = lines.indices.filter { (profile.percentages[lines[it].label.trim().lowercase()] ?: 0) > 0 }
                    lines = lines.mapIndexed { index, line ->
                        val pct = profile.percentages[line.label.trim().lowercase()] ?: 0
                        if (pct <= 0 || index !in eligible) line
                        else {
                            val amount = if (index == eligible.last()) total - assigned else kotlin.math.round(total * pct / 100.0).also { assigned += it }
                            line.copy(amount = amount.toLong().toString())
                        }
                    }
                    status = "Standard percentage split applied."
                } else status = "Enter a valid total amount first."
            }, modifier = Modifier.fillMaxWidth()) { Text("Apply standard split") }
            QuoteField("Car freight (₹)", carFreight, KeyboardType.Decimal) { value ->
                carFreight = value
                val index = lines.indexOfFirst { it.label.contains("car", true) }
                if (index >= 0) lines = lines.toMutableList().also { it[index] = it[index].copy(amount = value) }
            }
        }
        QuoteSection("Cost items") {
            lines.forEachIndexed { index, line ->
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Box(Modifier.weight(1.3f)) { QuoteField("Description", line.label) { value -> lines = lines.toMutableList().also { it[index] = it[index].copy(label = value) } } }
                    Box(Modifier.weight(1f)) { QuoteField("Amount ₹", line.amount, KeyboardType.Decimal) { value -> lines = lines.toMutableList().also { it[index] = it[index].copy(amount = value) } } }
                    TextButton(onClick = { lines = lines.filterIndexed { i, _ -> i != index } }) { Text("×") }
                }
            }
            OutlinedButton(onClick = { lines = lines + QuoteLine("New item", "0") }, modifier = Modifier.fillMaxWidth()) { Text("+ Add cost item") }
        }
        QuoteSection("Terms & conditions") {
            terms.forEachIndexed { index, term ->
                QuoteField("Term ${index + 1}", term, multiline = true) { value -> terms = terms.toMutableList().also { it[index] = value } }
                TextButton(onClick = { terms = terms.filterIndexed { i, _ -> i != index } }) { Text("Remove term") }
            }
            OutlinedButton(onClick = { terms = terms + "" }, modifier = Modifier.fillMaxWidth()) { Text("+ Add term") }
        }
        Card {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Live total", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                QuoteTotal("Subtotal", "₹ ${money(subtotal)}")
                QuoteTotal("GST (${gstPercent}%)", "₹ ${money(gst)}")
                HorizontalDivider()
                QuoteTotal("Total with GST", "₹ ${money(grand)}", true)
            }
        }
        Button(onClick = {
            if (customer.isBlank() || from.isBlank() || to.isBlank()) {
                status = "Customer name, moving from and moving to are required."
            } else {
                try {
                    val file = createQuotePdf(context, profile, date, customer, customerCompany, customerGst, from, to, doc, ourGst, gstPercent, lines, terms, subtotal, gst, grand)
                    val uri: Uri = FileProvider.getUriForFile(context, context.packageName + ".fileprovider", file)
                    val intent = android.content.Intent(android.content.Intent.ACTION_SEND).apply {
                        type = "application/pdf"
                        putExtra(android.content.Intent.EXTRA_STREAM, uri)
                        putExtra(android.content.Intent.EXTRA_SUBJECT, "Quotation - ${customer}")
                        addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    context.startActivity(android.content.Intent.createChooser(intent, "Share quotation PDF"))
                    status = "PDF generated. Choose an app to share or save it."
                } catch (error: Exception) {
                    status = "PDF export failed: ${error.message ?: "unknown error"}"
                }
            }
        }, modifier = Modifier.fillMaxWidth()) { Text("Generate & share PDF") }
        if (status.isNotBlank()) Text(status, color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodySmall)
    }
}

@Composable
private fun QuoteSection(title: String, content: @Composable ColumnScope.() -> Unit) {
    Card { Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp), content = content) }
    Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
}

@Composable
private fun QuoteField(label: String, value: String, keyboard: KeyboardType = KeyboardType.Text, multiline: Boolean = false, onChange: (String) -> Unit) {
    OutlinedTextField(value, onChange, label = { Text(label) }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = keyboard), minLines = if (multiline) 2 else 1)
}

@Composable
private fun QuoteTotal(label: String, value: String, strong: Boolean = false) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, fontWeight = if (strong) FontWeight.Bold else FontWeight.Normal)
        Text(value, fontWeight = FontWeight.Bold)
    }
}

private fun createQuotePdf(
    context: Context, p: QuoteProfile, date: String, customer: String, customerCompany: String, customerGst: String,
    from: String, to: String, doc: String, ourGst: String, gstPercent: String, lines: List<QuoteLine>,
    terms: List<String>, subtotal: Double, gst: Double, grand: Double
): File {
    val pdf = PdfDocument()
    val pageWidth = 595
    val pageHeight = 842
    val margin = 42f
    val body = Paint(Paint.ANTI_ALIAS_FLAG).apply { textSize = 10f; color = android.graphics.Color.DKGRAY }
    val bold = Paint(body).apply { typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD); color = android.graphics.Color.BLACK }
    var pageNo = 1
    var page = pdf.startPage(PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageNo).create())
    var canvas = page.canvas
    var y = 48f
    fun newPage() { pdf.finishPage(page); pageNo++; page = pdf.startPage(PdfDocument.PageInfo.Builder(pageWidth,pageHeight,pageNo).create()); canvas = page.canvas; y = 48f }
    fun line(text: String, paint: Paint = body, indent: Float = margin, gap: Float = 16f) {
        val maxWidth = pageWidth - margin - indent
        val words = text.split(" ")
        var current = ""
        for (word in words) {
            val candidate = if (current.isEmpty()) word else "$current $word"
            if (paint.measureText(candidate) > maxWidth && current.isNotEmpty()) {
                if (y > pageHeight - 48) newPage()
                canvas.drawText(current, indent, y, paint); y += gap; current = word
            } else current = candidate
        }
        if (current.isNotEmpty()) { if (y > pageHeight - 48) newPage(); canvas.drawText(current, indent, y, paint); y += gap }
    }
    line(p.company, Paint(bold).apply { textSize = 18f }, gap = 24f)
    line(p.cin, body); line(p.address, body); line("Phone: ${p.phone}" + if (p.showEmail) "  Email: ${p.email}" else "", body)
    y += 12f
    line("Date: $date     ${p.docLabel}: $doc", bold)
    line("${p.gstLabel}: $ourGst", body)
    line("Customer: $customer", bold); line("Company: $customerCompany"); line("Customer GST: $customerGst")
    line("Moving from: $from     Moving to: $to")
    y += 8f
    line("QUOTATION", Paint(bold).apply { textSize = 15f }, gap = 22f)
    line("Particulars", bold); lines.forEachIndexed { index, item -> line("${index + 1}. ${item.label}  —  ₹ ${money(item.amount.toDoubleOrNull() ?: 0.0)}") }
    y += 5f
    line("Subtotal: ₹ ${money(subtotal)}", bold); line("GST @ ${gstPercent}%: ₹ ${money(gst)}", bold); line("TOTAL WITH GST: ₹ ${money(grand)}", Paint(bold).apply { textSize = 12f }, gap = 20f)
    y += 8f; line("TERMS & CONDITIONS", bold)
    terms.forEachIndexed { index, term -> line("${index + 1}. $term", body, gap = 14f) }
    y += 8f; line("Thank you for your business.", bold)
    pdf.finishPage(page)
    val dir = File(context.cacheDir, "shared_quotes").apply { mkdirs() }
    val safeName = customer.trim().replace(Regex("[^A-Za-z0-9_-]+"), "_").ifBlank { "Customer" }
    val file = File(dir, "APML_Quotation_$safeName.pdf")
    FileOutputStream(file).use { pdf.writeTo(it) }
    pdf.close()
    return file
}
