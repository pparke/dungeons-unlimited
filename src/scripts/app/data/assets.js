/*
 * The `assets` module
 * ============================================================================
 *
 * Use this module to declare static Phaser Asset Packs, that would be loaded
 * using the `Loader#pack` API.
 *
 * Regarding how the game assets should be declared using this file, refer to
 * the sample `assetPack.json` included in the Phaser package, under
 * `bower_components/phaser/resources/` directory, for a more complete
 * reference.
 *
 */


export default {

  // - Boot Assets ------------------------------------------------------------
  boot: [
    {
      key: 'splash-screen',
      type: 'image',
      url: 'splash-screen.png'
    },

    {
      key: 'progress-bar',
      type: 'image',
      url: 'progress-bar.png'
    }
  ],

  // - Game assets ------------------------------------------------------------
  game: [
    {
      key: 'phaser',
      type: 'image',
      url: 'phaser.png'
    },
    {
      key: 'floors',
      type: 'image',
      url: 'img/floors.png'
    },
    {
      key: 'objects',
      type: 'image',
      url: 'img/objects.png'
    },
    {
      key: 'walls',
      type: 'image',
      url: 'img/walls.png'
    },
    {
      type: 'image',
      key: 'dust',
      url: 'img/dust.png'
    },
    {
      key: 'menuFont',
      type: 'image',
      url: 'img/Hoshi.png'
    },
    {
      type: "text",
      key: "floorKeys",
      url: "json/floorKeys.json",
      overwrite: false
    },
    {
      type: "text",
      key: "objectKeys",
      url: "json/objectKeys.json",
      overwrite: false
    },
    {
      type: "text",
      key: "wallKeys",
      url: "json/wallKeys.json",
      overwrite: false
    },
    {
      type: 'atlasJSONArray',
      key: 'player1',
      textureURL: 'img/Player0001.png',
      atlasURL: 'atlas/player.json',
      atlasData: null
    },
    {
      type: 'atlasJSONArray',
      key: 'player2',
      textureURL: 'img/Player0002.png',
      atlasURL: 'atlas/player.json',
      atlasData: null
    },
    {
      type: 'atlasJSONArray',
      key: 'player3',
      textureURL: 'img/Player0003.png',
      atlasURL: 'atlas/player.json',
      atlasData: null
    },
    {
      type: 'atlasJSONArray',
      key: 'GUI',
      textureURL: 'img/GUI.png',
      atlasURL: 'atlas/GUI.json',
      atlasData: null
    },
    {
      key: 'infoPane',
      type: 'image',
      url: 'img/infoPane.png'
    }
  ],

  // - Music and Sound effects ------------------------------------------------
  audio: [
    // // Example
    // {
    //   key: 'pow',
    //   type: 'audio',
    //   urls: [ 'pow.ogg', 'pow.m4a' ]
    // }
  ]

};
