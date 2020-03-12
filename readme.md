---
title: Fallback generator
---

The fallback generator is a standalone app to automatically generate fallbacks!

## How to use
---

Download the [app](https://drive.google.com/a/bannerboy.com/file/d/1I94RypOUTgKC3h2TFmg1suoYHGcP6rRq/view?usp=sharing) or clone the [repo](https://github.com/Bannerboy/fallback-generator.git).

If you run the fallback generator using the repo, run `npm start` from the command line to start it.

Load a project either by clicking 'load project' and selecting the folder with your banners in it, or by dragging a folder of banners onto the generator.

If you check "Save in banner", the generator will save each fallback into a folder with the same name as the banner it was captured from.

Press Generate and select where your fallbacks should go. If you want them inside your banner folders, select the same folder as you did when loading project.

![](01.jpg)

If there are any errors, they will show up in a log window after the generator finishes or is interrupted.

---
## Fast forward methods
There are three ways to seek to your desired time in the banner before capturing the fallback.

- **Seek to end (default)**

  This method will seek to the very end of your timeline and capture the fallback there. This is perfect if your banner does not loop and will work for most of those cases.

- **Seconds**

  This method will speed up your timeline 10x, and then simulate playing for as many seconds as you specify. This works for banners that loop, but it takes longer due to having to wait for the banner to play.

- **Callback**

  The callback method is the most stable method and should always work. To use it you have to add the following snippet to your banner code, after the timeline has initialized.

  ```javascript
  if (window.bb_fallback) {
    // seek to desired location in timeline
    main_tl.seek('fallback');
    // run bb_fallback when ready
    window.bb_fallback();
  }
  ```
