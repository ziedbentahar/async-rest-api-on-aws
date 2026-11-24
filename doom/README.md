# Doom-Like Game Demo

A standalone, web-based 3D first-person shooter game built with Babylon.js and HTML5. Play directly in your browser without any installation.

## Quick Start

1. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, or Edge)
2. Click on the game canvas to enable pointer lock and start playing
3. Use WASD or arrow keys to move around the arena
4. Use spacebar or mouse click to shoot
5. Press ESC to restart the game

## Features

- **3D First-Person Perspective**: Full 3D environment with first-person camera controls
- **Player Movement**: Smooth WASD/Arrow key-based movement with collision detection
- **Shooting Mechanic**: Raycast-based hit detection for accurate shooting
- **Enemy AI**: Intelligent enemies with patrol, chase, and attack behaviors
- **Health & Score System**: Track your health and score as you defeat enemies
- **Dynamic Difficulty**: Enemies increase in number as waves progress
- **Visual Feedback**: Hit animations, enemy death effects, and HUD status updates
- **Arena Environment**: Rectangular arena with walls, floor, ceiling, and obstacles for cover

## Controls

| Action | Control |
|--------|---------|
| Move Forward | W or ↑ |
| Move Backward | S or ↓ |
| Move Left | A or ← |
| Move Right | D or → |
| Shoot | Spacebar or Mouse Click |
| Look Around | Mouse Movement (click to lock) |
| Restart Game | ESC |

## Gameplay

- **Objective**: Survive waves of enemies and defeat them all
- **Health**: You start with 100 health. Enemies deal damage when close to you
- **Score**: Earn 100 points for each enemy defeated
- **Enemies**: Enemies spawn around the arena and either patrol or hunt you down
- **Victory**: Clear 5+ waves to win the game
- **Defeat**: Your health reaches 0 ends the game

## Technical Details

### Technology Stack
- **3D Engine**: Babylon.js v6+ (via CDN)
- **Graphics**: WebGL with Canvas rendering
- **Physics**: Basic collision detection with AABB (Axis-Aligned Bounding Box)
- **Input**: Mouse and keyboard handling with pointer lock API

### File Structure
```
doom/
├── index.html          # Main entry point
├── css/
│   └── style.css       # Styling and HUD layout
├── js/
│   ├── game.js         # Game engine and main loop
│   ├── player.js       # Player controller and shooting
│   ├── enemy.js        # Enemy AI and spawner
│   ├── environment.js  # Arena and collision system
│   └── ui.js           # HUD and game over screen
└── README.md           # This file
```

### Core Classes

- **Game**: Main game engine and render loop
- **Player**: First-person camera, movement, and shooting logic
- **Enemy**: AI behavior with patrol, chase, and attack states
- **EnemySpawner**: Manages enemy waves and spawning
- **Environment**: Arena construction and collision detection
- **UI**: HUD rendering and game state display

## Browser Compatibility

Tested and working on:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL support and ES6 JavaScript.

## Performance

- Targets 60 FPS on modern hardware
- Efficient collision detection
- Dynamic enemy spawning (max 15 enemies)
- Optimized Babylon.js rendering

## Known Limitations & Future Improvements

- No procedural level generation (single arena)
- No save/load system
- No multiplayer support
- No advanced 3D modeling (uses primitive shapes)
- No sound effects (silent gameplay)
- No mobile touch controls
- Enemy AI is relatively simple (no pathfinding around obstacles)

## Development

To modify the game:

1. **Enemy Behavior**: Edit `js/enemy.js` - modify patrol speed, attack range, vision range
2. **Arena Layout**: Edit `js/environment.js` - add/remove obstacles or change arena size
3. **Difficulty**: Edit `js/enemy.js` in `EnemySpawner.update()` - adjust spawn rates and enemy counts
4. **Player Stats**: Edit `js/player.js` - change health, speed, or weapon damage
5. **Visuals**: Edit `css/style.css` - customize HUD colors and styling

## License

This is a demonstration project. Feel free to modify and use as a learning resource.

## Credits

Built with Babylon.js (open-source 3D engine)
