# WISP

"WISP" stands for Web Interactive Storytelling Platform. It's ultimately envisioned as a set of authoring and publishing tools that let users create animated characters you can talk to with continuous speech recognition. In the early pre-alpha version you're looking at, I'm sure it falls far short of that. So the rest of this doc will mainly describe what it currently does.

## Current Features

* Create faces be combining reusable parts (eyes, nose, mouth).
* Faces support a standard set of animations that always work the same. These include:
  * Displaying 11 different emotions
  * Lip sync animation with Blair visemes
  * Blinking and lid level adjustments
  * Looking at specific targets
* Automatic lip animation based on processing of speech audio

## Notably Missing / Broken

* File management, saving, exporting
* Many buttons that don't do anything when you click on them

At some point, likely in 2023, I will deploy an MVP build to https://wisp.studio that has a full workflow ready to be used. At that point, the version in package.json will be updated to 1.x.x and this README will have much less caveats and apologies.

Until then, anything you see at https://wisp.studio is a toy or demo.

## The Libraries

In the interest of promoting an SDK for games, visual novels, and other multimedia projects, I've put some of WISP's functionality in NPM packages that can be imported as minimal dependencies. (You don't need to fork the WISP project to build something based on WISP's capabilities.)

See the repositories of these supporting libraries for more information.
* [sl-web-face](https://github.com/erikh2000/sl-web-face) - A library for animating faces on the web. It uses a web canvas for rendering.
* [sl-web-audio](https://github.com/erikh2000/sl-web-audio) - A library for loading, playing, and processing audio in a web browser.
* [sl-web-speech](https://github.com/erikh2000/sl-web-speech) - A library for handling speech on web with a focus on covering interactive storytelling use cases. In particular, continuous realtime speech recognition that aims to match expected keywords.
* [sl-spiel](https://github.com/erikh2000/sl-spiel) - A library for importing, accessing, and exporting data structures used for interactive dialogue.

Libraries with "web" in their name expect access to standard browser APIs that won't be available in a command-line NodeJS app.

## Licensing

My code and other files in this repository are licensed under the MIT open source license.

But if you see a LICENSE file in a sub-directory of the repository, that license will apply to all files found in that directory.

For example, the CMU phonetic dictionary (cmudict) has its own license.

### Contributing

The project isn't open to contributions at this point. But that could change. Contact me if you'd like to collaborate.

### Contacting

You can reach me on LinkedIn. I'll accept connections if you will just mention "WISP" or some other shared interest in your connection request.

https://www.linkedin.com/in/erikhermansen/
