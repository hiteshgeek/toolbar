<?php
include_once __DIR__ . '/includes/functions.php';
?>

<!DOCTYPE html>
<html lang="en">

<head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Toolbar – Dynamic multipurpose plug and play toolbar</title>
      <meta
            name="description"
            content="Embeddable screenshot & capture UI: full-page, visible, selection, hotkeys, and more." />
      <link rel="stylesheet" href="<?php echo asset('main.css'); ?>" />
      <link rel="stylesheet" href="<?php echo asset('toolbar.css'); ?>" />
</head>

<body>
      <div id="app">
            <img src="src/assets/images/image2.jpg" alt="" class='main_image'>
      </div>

      <script type="module" src="<?= asset('toolbar.js') ?>"></script>
      <script nomodule src="<?= asset('toolbar.js', 'nomodule') ?>"></script>

      <script type="module" src="<?= asset('main.js') ?>"></script>
      <script nomodule src="<?php echo asset('main.js', 'nomodule'); ?>"></script>

</body>

</html>