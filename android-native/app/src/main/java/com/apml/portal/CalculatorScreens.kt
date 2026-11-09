package com.apml.portal

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import java.text.NumberFormat
import java.util.Locale
import kotlin.math.roundToInt

private fun rupees(value: Double) = NumberFormat.getCurrencyInstance(Locale("en", "IN")).format(value)

@Composable
fun NativeCalculatorScreen(route: String, onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        TextButton(onClick = onBack) { Text("← Workspace") }
        when (route) {
            "lite" -> LiteRateScreen()
            "car-rate" -> CarRateScreen()
            "local-rate" -> LocalRateScreen()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun LiteRateScreen() {
    val cities = listOf("Delhi NCR (KWS)", "Chennai (CHE)", "Bangalore (BNG)", "Kolkata (KOL)")
    val rates = listOf(listOf(125,115,100,85), listOf(125,115,100,85), listOf(120,110,95,80), listOf(140,130,105,100))
    var city by remember { mutableIntStateOf(0) }
    var open by remember { mutableStateOf(false) }
    var volume by remember { mutableStateOf("50") }
    val cft = volume.toDoubleOrNull() ?: 0.0
    val tier = when { cft <= 50 -> 0; cft <= 100 -> 1; cft <= 250 -> 2; else -> 3 }
    val eligible = cft in 0.000001..450.0
    val raw = if (eligible) (cft * rates[city][tier]).roundToInt().toDouble() else 0.0
    TitleBlock("APML Lite", "Intercity freight estimate")
    ExposedDropdownMenuBox(expanded = open, onExpandedChange = { open = it }) {
        OutlinedTextField(cities[city], {}, readOnly = true, label = { Text("Destination") }, trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(open) }, modifier = Modifier.menuAnchor().fillMaxWidth())
        ExposedDropdownMenu(expanded = open, onDismissRequest = { open = false }) {
            cities.forEachIndexed { index, label -> DropdownMenuItem(text = { Text(label) }, onClick = { city = index; open = false }) }
        }
    }
    NumericInput("Volume (CFT)", volume) { volume = it }
    ResultPanel("Freight estimate", listOf(
        "Volume" to "$cft CFT",
        "Rate" to if (eligible) "₹${rates[city][tier]} / CFT" else "—",
        "Slab" to if (eligible) listOf("1–50", "51–100", "101–250", "251–450")[tier] + " CFT" else "Not eligible",
        "Calculated" to if (eligible) rupees(raw) else "—",
        "Final freight" to if (eligible) rupees(maxOf(5000.0, raw)) else if (cft > 450) "Not eligible above 450 CFT" else rupees(0.0)
    ))
    if (eligible && raw < 5000) Text("₹5,000 minimum freight applied.", color = MaterialTheme.colorScheme.primary)
}

@Composable
private fun CarRateScreen() {
    val labels = listOf("Hatchback", "Sedan / Compact SUV", "SUV / Luxury / Big Car")
    val base = listOf(10000.0, 12000.0, 15000.0)
    val perKm = listOf(12.0, 13.0, 15.0)
    var model by remember { mutableStateOf("") }
    var category by remember { mutableIntStateOf(1) }
    var distance by remember { mutableStateOf("600") }
    val km = distance.toIntOrNull() ?: 0
    val extraKm = maxOf(0, km - 600)
    val extra = extraKm * perKm[category]
    TitleBlock("Car Transport Rate", "Intercity vehicle transport estimate")
    OutlinedTextField(model, { model = it; category = guessVehicleClass(it, category) }, label = { Text("Car model (optional)") }, modifier = Modifier.fillMaxWidth())
    Text("Vehicle category", fontWeight = FontWeight.SemiBold)
    labels.forEachIndexed { index, label ->
        Row(verticalAlignment = Alignment.CenterVertically) {
            RadioButton(selected = category == index, onClick = { category = index })
            Text(label)
        }
    }
    NumericInput("Distance (KM)", distance) { distance = it }
    ResultPanel("Rate estimate", listOf(
        "Category" to labels[category],
        "Distance" to "$km KM",
        "Base rate (first 600 KM)" to rupees(if (km > 0) base[category] else 0.0),
        "Extra distance" to "$extraKm KM",
        "Extra charge" to rupees(extra),
        "Estimated total" to rupees(if (km > 0) base[category] + extra else 0.0)
    ))
    Text("Extra distance is charged only beyond 600 KM.", style = MaterialTheme.typography.bodySmall)
}

private fun guessVehicleClass(value: String, fallback: Int): Int {
    val s = value.lowercase()
    val large = listOf("thar","fortuner","scorpio","innova","safari","harrier","xuv700","defender","range rover","ertiga","xl6","carens","hector","bmw","mercedes","audi")
    val medium = listOf("city","verna","creta","dzire","nexon","seltos","brezza","slavia","virtus","ciaz","amaze","punch","venue","sonet","taigun","fronx","curvv","elevate","kushaq")
    val small = listOf("swift","alto","wagon","i10","i20","baleno","tiago","altroz","kwid","celerio","ignis","glanza")
    return when { large.any(s::contains) -> 2; medium.any(s::contains) -> 1; small.any(s::contains) -> 0; else -> fallback }
}

@Composable
private fun LocalRateScreen() {
    var volume by remember { mutableStateOf("200") }
    var crossing by remember { mutableStateOf(false) }
    var trips by remember { mutableStateOf("1") }
    var manpower by remember { mutableStateOf(false) }
    var people by remember { mutableStateOf("1") }
    var appliance by remember { mutableStateOf(false) }
    var applianceCost by remember { mutableStateOf("0") }
    var crate by remember { mutableStateOf(false) }
    var crateCost by remember { mutableStateOf("0") }
    var rope by remember { mutableStateOf(false) }
    var ropeCost by remember { mutableStateOf("0") }
    var mathadi by remember { mutableStateOf(false) }
    var mathadiCost by remember { mutableStateOf("0") }
    val cft = maxOf(0.0, volume.toDoubleOrNull() ?: 0.0)
    val rate = if (cft > 500) 20.0 else 25.0
    val raw = cft * rate
    val base = maxOf(5000.0, raw)
    val add = (if (crossing) maxOf(1, trips.toIntOrNull() ?: 1) * 1500.0 else 0.0) +
        (if (manpower) maxOf(1, people.toIntOrNull() ?: 1) * 1000.0 else 0.0) +
        (if (appliance) applianceCost.toDoubleOrNull() ?: 0.0 else 0.0) +
        (if (crate) crateCost.toDoubleOrNull() ?: 0.0 else 0.0) +
        (if (rope) ropeCost.toDoubleOrNull() ?: 0.0 else 0.0) +
        (if (mathadi) mathadiCost.toDoubleOrNull() ?: 0.0 else 0.0)
    val total = base + add
    TitleBlock("Local Shifting Rate", "Volume-based estimate with optional services")
    NumericInput("Volume (CFT)", volume) { volume = it }
    Slider(value = cft.coerceIn(0.0,1000.0).toFloat(), onValueChange = { volume = it.roundToInt().toString() }, valueRange = 0f..1000f)
    AddonInput("Building crossing / extra trip (₹1,500 each)", crossing, { crossing = it }, if (crossing) "Trips" else null, trips) { trips = it }
    AddonInput("Additional manpower (₹1,000 each)", manpower, { manpower = it }, if (manpower) "Persons" else null, people) { people = it }
    AddonInput("Appliance handling", appliance, { appliance = it }, if (appliance) "Amount (₹)" else null, applianceCost) { applianceCost = it }
    AddonInput("Crating", crate, { crate = it }, if (crate) "Amount (₹)" else null, crateCost) { crateCost = it }
    AddonInput("Rope / special packing", rope, { rope = it }, if (rope) "Amount (₹)" else null, ropeCost) { ropeCost = it }
    AddonInput("Mathadi / labour", mathadi, { mathadi = it }, if (mathadi) "Amount (₹)" else null, mathadiCost) { mathadiCost = it }
    ResultPanel("Local shifting estimate", listOf(
        "Rate" to "₹${rate.toInt()} / CFT",
        "Raw volume cost" to rupees(raw),
        "Base charge (₹5,000 minimum)" to rupees(base),
        "Add-ons" to rupees(add),
        "Advance payable (20%)" to rupees(kotlin.math.round(total * .20)),
        "Estimated total" to rupees(total)
    ))
}

@Composable
private fun AddonInput(label: String, checked: Boolean, onChecked: (Boolean) -> Unit, field: String?, value: String, onValue: (String) -> Unit) {
    Column {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked, onCheckedChange = onChecked)
            Text(label, style = MaterialTheme.typography.bodyMedium)
        }
        if (field != null) NumericInput(field, value, onValue)
    }
}

@Composable
private fun NumericInput(label: String, value: String, onValue: (String) -> Unit) {
    OutlinedTextField(value, { onValue(it.filter { ch -> ch.isDigit() || ch == '.' }) }, label = { Text(label) }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), modifier = Modifier.fillMaxWidth())
}

@Composable
private fun TitleBlock(title: String, subtitle: String) {
    Text(title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
    Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
}

@Composable
private fun ResultPanel(title: String, rows: List<Pair<String, String>>) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            rows.forEach { row ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text(row.first, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                    Text(row.second, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}
