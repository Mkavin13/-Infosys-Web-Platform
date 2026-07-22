package com.carbontrack.service;

import java.util.List;
import java.util.Map;

import static java.util.Map.entry;

public class RecommendationProvider {

    private static final Map<String, List<String>> RECOMMENDATIONS = Map.ofEntries(
        entry("CAR_PETROL", List.of("Use public transport twice a week to cut emissions", "Carpool with colleagues", "Consider walking for trips under 2 km")),
        entry("CAR_DIESEL", List.of("Swap single-passenger diesel commutes for train or bus travel", "Perform regular vehicle maintenance to optimize fuel usage")),
        entry("CAR_ELECTRIC", List.of("Charge your vehicle during off-peak hours", "Use renewable energy sources for charging if possible")),
        entry("FLIGHT_SHORT", List.of("Take high-speed rail instead of short-haul flights when possible", "Offset flight emissions using verified carbon offset programs")),
        entry("FLIGHT_LONG", List.of("Combine multiple short trips into one longer stay", "Choose direct flights to minimize takeoff/landing emissions")),
        entry("PUBLIC_TRANSIT", List.of("Continue using public transit — it is 6x more efficient than driving!")),
        entry("GRID_COAL", List.of("Replace household bulbs with efficient LEDs", "Unplug chargers and appliances when not in use")),
        entry("GRID_MIX", List.of("Consider switching to a green energy provider", "Use smart power strips to prevent phantom power draw")),
        entry("RENEWABLE", List.of("Great job using renewable power! Keep tracking to sustain your profile")),
        entry("MEAT_BEEF", List.of("Reduce red meat consumption — beef has high methane impact", "Try meatless Mondays")),
        entry("MEAT_POULTRY", List.of("Substitute poultry with plant-based protein options")),
        entry("VEGETARIAN", List.of("Integrate more vegan (fully plant-based) meals into your weekly schedule")),
        entry("VEGAN", List.of("Outstanding! Plant-based diets reduce food-related footprint by up to 70%")),
        entry("CLOTHING", List.of("Buy pre-owned clothing or support sustainable fashion brands")),
        entry("ELECTRONICS", List.of("Repair electronic devices instead of buying new ones immediately")),
        entry("APPLIANCES", List.of("Choose Energy Star certified appliances for lower standby draw")),
        entry("GENERAL_GOODS", List.of("Buy local groceries to minimize transport footprint"))
    );

    private static final List<String> DEFAULT_TIPS = List.of(
        "Log your daily footprint baseline to uncover high-impact habits.",
        "Set a reduction goal in the goals panel to stay accountable."
    );

    public static List<String> getTips(String activityType) {
        return RECOMMENDATIONS.getOrDefault(activityType.toUpperCase(), DEFAULT_TIPS);
    }
}
