#!/usr/bin/env python3
"""
Regenerate beijing-parchment.png without the default title text.
Uses osmnx + matplotlib with custom parchment styling.

Run: python3 scripts/generate-map-poster.py
"""

import os

import osmnx as ox
import matplotlib
import matplotlib.pyplot as plt

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "../public/maps/beijing-parchment.png")

BOUNDS = {
    "west": 116.0396,
    "east": 116.7430,
    "south": 39.6359,
    "north": 40.1755,
}

# Parchment-like styling (white bg, muted roads)
BG_COLOR = "#f5f3ef"
EDGE_COLOR = "#b0a090"
EDGE_WIDTH = 0.6
FIG_SIZE = (20, 20)  # square figure matching the bbox aspect roughly
DPI = 300


def main():
    print("Fetching Beijing road network...")
    bbox = (BOUNDS["west"], BOUNDS["south"], BOUNDS["east"], BOUNDS["north"])
    G = ox.graph_from_bbox(
        bbox,
        network_type="drive",
        simplify=True,
        retain_all=True,
    )

    print(f"Graph has {len(G.nodes)} nodes, {len(G.edges)} edges")

    print("Plotting...")
    # Use a non-interactive backend for headless generation
    matplotlib.use("Agg")

    fig, ax = ox.plot_graph(
        G,
        figsize=FIG_SIZE,
        node_size=0,
        edge_color=EDGE_COLOR,
        edge_linewidth=EDGE_WIDTH,
        edge_alpha=0.7,
        bgcolor=BG_COLOR,
        show=False,
        close=False,
    )

    # Remove any default title / annotations osmnx may have added
    ax.set_title("")
    # Also remove any text children that look like titles
    for child in ax.get_children():
        if isinstance(child, matplotlib.text.Text):
            child.set_text("")

    # Tight layout without extra padding
    fig.tight_layout(pad=0)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    fig.savefig(
        OUTPUT_PATH,
        dpi=DPI,
        facecolor=BG_COLOR,
        edgecolor="none",
        bbox_inches="tight",
        pad_inches=0.05,
    )
    plt.close(fig)

    size_kb = os.path.getsize(OUTPUT_PATH) / 1024
    print(f"Wrote {OUTPUT_PATH} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
