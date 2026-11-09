package com.apml.portal

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.PersonSearch
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument

private val Brand = Color(0xFFB91C1C)
private val Page = Color(0xFFF6F7F9)
private val Ink = Color(0xFF172033)
private val Muted = Color(0xFF667085)

data class PortalModule(
    val title: String,
    val description: String,
    val icon: ImageVector,
    val route: String,
    val group: String
)

private val modules = listOf(
    PortalModule("Quotation Studio", "Create and export customer quotations", Icons.Default.ReceiptLong, "quotation", "Operations"),
    PortalModule("Cloud Drive", "Browse documents and shared files", Icons.Default.Folder, "drive", "Workspace"),
    PortalModule("Media Gallery", "Packing standards, photos and videos", Icons.Default.Image, "gallery", "Workspace"),
    PortalModule("Hub Directory", "Search branches and contacts", Icons.Default.Groups, "directory", "People"),
    PortalModule("Field Officers", "Find field officer information", Icons.Default.PersonSearch, "officers", "People"),
    PortalModule("Analytics", "Traffic, downloads and engagement", Icons.Default.Analytics, "analytics", "Insights"),
    PortalModule("APML Lite", "Local shifting rate calculator", Icons.Default.Calculate, "lite", "Calculators"),
    PortalModule("Car Rate", "Vehicle transport calculator", Icons.Default.Calculate, "car-rate", "Calculators"),
    PortalModule("Local Rate", "Volume and consignment calculator", Icons.Default.Calculate, "local-rate", "Calculators"),
    PortalModule("System Health", "Service status and diagnostics", Icons.Default.HealthAndSafety, "health", "System"),
    PortalModule("Bug Reports", "Send feedback and report problems", Icons.Default.Description, "bug-report", "System"),
    PortalModule("Settings", "App preferences and information", Icons.Default.Settings, "settings", "System")
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = android.graphics.Color.rgb(246, 247, 249)
        window.navigationBarColor = android.graphics.Color.rgb(246, 247, 249)
        window.decorView.systemUiVisibility =
            android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or
            android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        setContent { APMLNativeApp() }
    }
}

@Composable
private fun APMLNativeApp() {
    val nav = rememberNavController()
    MaterialTheme(
        colorScheme = MaterialTheme.colorScheme.copy(
            primary = Brand,
            background = Page,
            surface = Color.White,
            onBackground = Ink,
            onSurface = Ink
        )
    ) {
        Surface(modifier = Modifier.fillMaxSize(), color = Page) {
            NavHost(navController = nav, startDestination = "home") {
                composable("home") { Dashboard(onOpen = { nav.navigate(it) }) }
                composable(
                    "module/{route}",
                    arguments = listOf(navArgument("route") { type = NavType.StringType })
                ) { entry ->
                    val route = entry.arguments?.getString("route").orEmpty()
                    val module = modules.firstOrNull { it.route == route }
                    ModulePreview(module = module, onBack = { nav.popBackStack() })
                }
                modules.forEach { module ->
                    composable(module.route) {
                        ModulePreview(module = module, onBack = { nav.popBackStack() })
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun Dashboard(onOpen: (String) -> Unit) {
    Scaffold(
        containerColor = Page,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("APML Portal", fontWeight = FontWeight.Bold, color = Ink)
                        Text("NATIVE ANDROID", style = MaterialTheme.typography.labelSmall, color = Brand)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Page)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 18.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Card(
                shape = RoundedCornerShape(22.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF202B3D)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                    Text("Operations, simplified.", color = Color.White, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    Text("Your APML workspace is being rebuilt as a fully native Android app.", color = Color(0xFFD6DCE6), style = MaterialTheme.typography.bodyMedium)
                    Text("NATIVE PREVIEW · FEATURES IN MIGRATION", color = Color(0xFFFFC5C5), style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                }
            }
            Text("WORKSPACE", color = Muted, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(bottom = 24.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(modules) { module ->
                    ModuleCard(module = module, onClick = { onOpen(module.route) })
                }
            }
        }
    }
}

@Composable
private fun ModuleCard(module: PortalModule, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().height(142.dp).clickable(onClick = onClick),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(15.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Icon(module.icon, contentDescription = null, tint = Brand)
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(module.title, color = Ink, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.titleSmall)
                Text(module.description, color = Muted, style = MaterialTheme.typography.bodySmall, maxLines = 2)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ModulePreview(module: PortalModule?, onBack: () -> Unit) {
    if (module?.route == "quotation") {
        NativeQuotationScreen(onBack)
        return
    }
    if (module?.route == "lite" || module?.route == "car-rate" || module?.route == "local-rate") {
        NativeCalculatorScreen(module.route, onBack)
        return
    }
    var note by remember { mutableStateOf("This module is part of the native migration plan.") }
    Scaffold(
        containerColor = Page,
        topBar = {
            TopAppBar(
                title = { Text(module?.title ?: "APML Portal", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Page)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(22.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(module?.group?.uppercase() ?: "MODULE", color = Brand, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
            Text(module?.description ?: "Native module", style = MaterialTheme.typography.titleLarge, color = Ink)
            Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Native implementation pending", color = Ink, fontWeight = FontWeight.Bold)
                    Text(note, color = Muted, style = MaterialTheme.typography.bodyMedium)
                    Text("This preview is intentionally not connected to production data yet. Existing APML website and backend remain untouched.", color = Muted, style = MaterialTheme.typography.bodySmall)
                }
            }
            Spacer(Modifier.height(4.dp))
            Text("We will migrate and verify each module before this preview replaces the current app.", color = Muted, style = MaterialTheme.typography.bodySmall)
        }
    }
}
