Directory structure:
└── vshopapp-mobile/
    ├── README.md
    ├── app.json
    ├── babel.config.js
    ├── eas.json
    ├── index.ts
    ├── LICENSE
    ├── metro.config.js
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── .eslintrc.js
    ├── .npmrc
    ├── app/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── language.tsx
    │   ├── reauth.tsx
    │   ├── setup.tsx
    │   └── (authenticated)/
    │       ├── _layout.tsx
    │       ├── accessories.tsx
    │       ├── bundles.tsx
    │       ├── gallery.tsx
    │       ├── night_market.tsx
    │       ├── profile.tsx
    │       ├── settings.tsx
    │       └── shop.tsx
    ├── assets/
    │   └── i18n/
    │       ├── ar.json
    │       ├── de.json
    │       ├── en.json
    │       ├── es.json
    │       ├── fr.json
    │       ├── it.json
    │       ├── jp.json
    │       ├── ko.json
    │       ├── no.json
    │       ├── pl.json
    │       ├── pt.json
    │       ├── ro.json
    │       ├── ru.json
    │       ├── ta.json
    │       ├── th.json
    │       ├── tr.json
    │       ├── uk.json
    │       ├── vi.json
    │       ├── zh-Hans.json
    │       └── zh-Hant.json
    ├── components/
    │   ├── BatteryOptimizationWarning.tsx
    │   ├── BundleImage.tsx
    │   ├── BundleItem.tsx
    │   ├── Countdown.tsx
    │   ├── CurrencyIcon.tsx
    │   ├── GalleryItem.tsx
    │   ├── Loading.tsx
    │   ├── LoginWebView.tsx
    │   ├── NightMarketItem.tsx
    │   ├── PlausibleProvider.tsx
    │   ├── ShopAccessoryItem.tsx
    │   ├── ShopItem.tsx
    │   └── popups/
    │       ├── DonatePopup.tsx
    │       ├── MediaPopup.tsx
    │       └── UpdatePopup.tsx
    ├── constants/
    │   └── Colors.ts
    ├── hooks/
    │   ├── useFeatureStore.ts
    │   ├── useUserStore.ts
    │   └── useWishlistStore.ts
    ├── types/
    │   ├── App.d.ts
    │   ├── https-browserify.d.ts
    │   ├── valorant-api.d.ts
    │   ├── valorant-assets.d.ts
    │   └── vshop-api.d.ts
    ├── utils/
    │   ├── localization.ts
    │   ├── misc.ts
    │   ├── plausible.ts
    │   ├── valorant-api.ts
    │   ├── valorant-assets.ts
    │   ├── vshop-api.ts
    │   └── wishlist.ts
    └── .github/
        └── workflows/
            └── build-release.yaml

================================================
FILE: README.md
================================================
# VShop
<a href="https://github.com/VShopApp/mobile/releases/latest/download/VShop.apk">
  <img alt="GitHub release (latest by date and asset)" src="https://img.shields.io/github/downloads/VShopApp/mobile/latest/VShop.apk?label=APK&color=%23fa4454&logo=android&logoColor=white">
</a>

VShop allows you to check your game Store, Night Market, Profile and more. It runs entirely on your device and securely transmits your credentials to the official Riot Games servers (more information in our <a href="https://docs.vshop.one/security">docs</a>).

## Translations
Translations are available on [Weblate](https://hosted.weblate.org/projects/vshop/mobile/).<br>
<a href="https://hosted.weblate.org/engage/vshop/">
<img src="https://hosted.weblate.org/widget/vshop/mobile/multi-red.svg" alt="Translation status" />
</a>

## Credits
This app would not have been possible without the following projects:
- [Unofficial API documentation](https://github.com/techchrism/valorant-api-docs)
- [In-Game assets](https://valorant-api.com) 

I would also like to thank all of our translations and other projects members, which are listed on the [credits page](https://vshop.one/credits) 💖



================================================
FILE: app.json
================================================
{
  "expo": {
    "name": "VShop",
    "slug": "vshop",
    "version": "3.1.2",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "vshop",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#fa4454"
    },
    "ios": {
      "bundleIdentifier": "dev.vasc.vshop",
      "buildNumber": "32",
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "monochromeImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#fa4454"
      },
      "permissions": [
        "android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"
      ],
      "package": "dev.vasc.vshop2",
      "versionCode": 77
    },
    "web": {
      "bundler": "metro",
      "output": "static"
    },
    "plugins": [
      "expo-router",
      "expo-localization",
      [
        "expo-dev-launcher",
        {
          "launchMode": "most-recent"
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#fa4454"
        }
      ],
      "react-native-background-fetch"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "ac45f951-5b85-4ba9-85e4-fa80e892f9e0"
      }
    },
    "owner": "the_vasc"
  }
}



================================================
FILE: babel.config.js
================================================
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-paper/babel", "react-native-reanimated/plugin"], // reanimated has to be last!
  };
};



================================================
FILE: eas.json
================================================
{
  "cli": {
    "version": ">= 12.5.1",
    "appVersionSource": "local"
  },
  "build": {
    "development": {
      "android": {
        "buildType": "apk"
      },
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}



================================================
FILE: index.ts
================================================
import "expo-router/entry";

import BackgroundFetch from "react-native-background-fetch";
import { wishlistBgTask } from "./utils/wishlist";

BackgroundFetch.registerHeadlessTask(async (event) => {
  let taskId = event.taskId;
  let isTimeout = event.timeout;
  if (isTimeout) {
    console.log("[BackgroundFetch] Headless TIMEOUT:", taskId);
    BackgroundFetch.finish(taskId);
    return;
  }

  await wishlistBgTask();
  BackgroundFetch.finish(taskId);
});



================================================
FILE: LICENSE
================================================
                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

 Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

                            Preamble

  The GNU General Public License is a free, copyleft license for
software and other kinds of works.

  The licenses for most software and other practical works are designed
to take away your freedom to share and change the works.  By contrast,
the GNU General Public License is intended to guarantee your freedom to
share and change all versions of a program--to make sure it remains free
software for all its users.  We, the Free Software Foundation, use the
GNU General Public License for most of our software; it applies also to
any other work released this way by its authors.  You can apply it to
your programs, too.

  When we speak of free software, we are referring to freedom, not
price.  Our General Public Licenses are designed to make sure that you
have the freedom to distribute copies of free software (and charge for
them if you wish), that you receive source code or can get it if you
want it, that you can change the software or use pieces of it in new
free programs, and that you know you can do these things.

  To protect your rights, we need to prevent others from denying you
these rights or asking you to surrender the rights.  Therefore, you have
certain responsibilities if you distribute copies of the software, or if
you modify it: responsibilities to respect the freedom of others.

  For example, if you distribute copies of such a program, whether
gratis or for a fee, you must pass on to the recipients the same
freedoms that you received.  You must make sure that they, too, receive
or can get the source code.  And you must show them these terms so they
know their rights.

  Developers that use the GNU GPL protect your rights with two steps:
(1) assert copyright on the software, and (2) offer you this License
giving you legal permission to copy, distribute and/or modify it.

  For the developers' and authors' protection, the GPL clearly explains
that there is no warranty for this free software.  For both users' and
authors' sake, the GPL requires that modified versions be marked as
changed, so that their problems will not be attributed erroneously to
authors of previous versions.

  Some devices are designed to deny users access to install or run
modified versions of the software inside them, although the manufacturer
can do so.  This is fundamentally incompatible with the aim of
protecting users' freedom to change the software.  The systematic
pattern of such abuse occurs in the area of products for individuals to
use, which is precisely where it is most unacceptable.  Therefore, we
have designed this version of the GPL to prohibit the practice for those
products.  If such problems arise substantially in other domains, we
stand ready to extend this provision to those domains in future versions
of the GPL, as needed to protect the freedom of users.

  Finally, every program is threatened constantly by software patents.
States should not allow patents to restrict development and use of
software on general-purpose computers, but in those that do, we wish to
avoid the special danger that patents applied to a free program could
make it effectively proprietary.  To prevent this, the GPL assures that
patents cannot be used to render the program non-free.

  The precise terms and conditions for copying, distribution and
modification follow.

                       TERMS AND CONDITIONS

  0. Definitions.

  "This License" refers to version 3 of the GNU General Public License.

  "Copyright" also means copyright-like laws that apply to other kinds of
works, such as semiconductor masks.

  "The Program" refers to any copyrightable work licensed under this
License.  Each licensee is addressed as "you".  "Licensees" and
"recipients" may be individuals or organizations.

  To "modify" a work means to copy from or adapt all or part of the work
in a fashion requiring copyright permission, other than the making of an
exact copy.  The resulting work is called a "modified version" of the
earlier work or a work "based on" the earlier work.

  A "covered work" means either the unmodified Program or a work based
on the Program.

  To "propagate" a work means to do anything with it that, without
permission, would make you directly or secondarily liable for
infringement under applicable copyright law, except executing it on a
computer or modifying a private copy.  Propagation includes copying,
distribution (with or without modification), making available to the
public, and in some countries other activities as well.

  To "convey" a work means any kind of propagation that enables other
parties to make or receive copies.  Mere interaction with a user through
a computer network, with no transfer of a copy, is not conveying.

  An interactive user interface displays "Appropriate Legal Notices"
to the extent that it includes a convenient and prominently visible
feature that (1) displays an appropriate copyright notice, and (2)
tells the user that there is no warranty for the work (except to the
extent that warranties are provided), that licensees may convey the
work under this License, and how to view a copy of this License.  If
the interface presents a list of user commands or options, such as a
menu, a prominent item in the list meets this criterion.

  1. Source Code.

  The "source code" for a work means the preferred form of the work
for making modifications to it.  "Object code" means any non-source
form of a work.

  A "Standard Interface" means an interface that either is an official
standard defined by a recognized standards body, or, in the case of
interfaces specified for a particular programming language, one that
is widely used among developers working in that language.

  The "System Libraries" of an executable work include anything, other
than the work as a whole, that (a) is included in the normal form of
packaging a Major Component, but which is not part of that Major
Component, and (b) serves only to enable use of the work with that
Major Component, or to implement a Standard Interface for which an
implementation is available to the public in source code form.  A
"Major Component", in this context, means a major essential component
(kernel, window system, and so on) of the specific operating system
(if any) on which the executable work runs, or a compiler used to
produce the work, or an object code interpreter used to run it.

  The "Corresponding Source" for a work in object code form means all
the source code needed to generate, install, and (for an executable
work) run the object code and to modify the work, including scripts to
control those activities.  However, it does not include the work's
System Libraries, or general-purpose tools or generally available free
programs which are used unmodified in performing those activities but
which are not part of the work.  For example, Corresponding Source
includes interface definition files associated with source files for
the work, and the source code for shared libraries and dynamically
linked subprograms that the work is specifically designed to require,
such as by intimate data communication or control flow between those
subprograms and other parts of the work.

  The Corresponding Source need not include anything that users
can regenerate automatically from other parts of the Corresponding
Source.

  The Corresponding Source for a work in source code form is that
same work.

  2. Basic Permissions.

  All rights granted under this License are granted for the term of
copyright on the Program, and are irrevocable provided the stated
conditions are met.  This License explicitly affirms your unlimited
permission to run the unmodified Program.  The output from running a
covered work is covered by this License only if the output, given its
content, constitutes a covered work.  This License acknowledges your
rights of fair use or other equivalent, as provided by copyright law.

  You may make, run and propagate covered works that you do not
convey, without conditions so long as your license otherwise remains
in force.  You may convey covered works to others for the sole purpose
of having them make modifications exclusively for you, or provide you
with facilities for running those works, provided that you comply with
the terms of this License in conveying all material for which you do
not control copyright.  Those thus making or running the covered works
for you must do so exclusively on your behalf, under your direction
and control, on terms that prohibit them from making any copies of
your copyrighted material outside their relationship with you.

  Conveying under any other circumstances is permitted solely under
the conditions stated below.  Sublicensing is not allowed; section 10
makes it unnecessary.

  3. Protecting Users' Legal Rights From Anti-Circumvention Law.

  No covered work shall be deemed part of an effective technological
measure under any applicable law fulfilling obligations under article
11 of the WIPO copyright treaty adopted on 20 December 1996, or
similar laws prohibiting or restricting circumvention of such
measures.

  When you convey a covered work, you waive any legal power to forbid
circumvention of technological measures to the extent such circumvention
is effected by exercising rights under this License with respect to
the covered work, and you disclaim any intention to limit operation or
modification of the work as a means of enforcing, against the work's
users, your or third parties' legal rights to forbid circumvention of
technological measures.

  4. Conveying Verbatim Copies.

  You may convey verbatim copies of the Program's source code as you
receive it, in any medium, provided that you conspicuously and
appropriately publish on each copy an appropriate copyright notice;
keep intact all notices stating that this License and any
non-permissive terms added in accord with section 7 apply to the code;
keep intact all notices of the absence of any warranty; and give all
recipients a copy of this License along with the Program.

  You may charge any price or no price for each copy that you convey,
and you may offer support or warranty protection for a fee.

  5. Conveying Modified Source Versions.

  You may convey a work based on the Program, or the modifications to
produce it from the Program, in the form of source code under the
terms of section 4, provided that you also meet all of these conditions:

    a) The work must carry prominent notices stating that you modified
    it, and giving a relevant date.

    b) The work must carry prominent notices stating that it is
    released under this License and any conditions added under section
    7.  This requirement modifies the requirement in section 4 to
    "keep intact all notices".

    c) You must license the entire work, as a whole, under this
    License to anyone who comes into possession of a copy.  This
    License will therefore apply, along with any applicable section 7
    additional terms, to the whole of the work, and all its parts,
    regardless of how they are packaged.  This License gives no
    permission to license the work in any other way, but it does not
    invalidate such permission if you have separately received it.

    d) If the work has interactive user interfaces, each must display
    Appropriate Legal Notices; however, if the Program has interactive
    interfaces that do not display Appropriate Legal Notices, your
    work need not make them do so.

  A compilation of a covered work with other separate and independent
works, which are not by their nature extensions of the covered work,
and which are not combined with it such as to form a larger program,
in or on a volume of a storage or distribution medium, is called an
"aggregate" if the compilation and its resulting copyright are not
used to limit the access or legal rights of the compilation's users
beyond what the individual works permit.  Inclusion of a covered work
in an aggregate does not cause this License to apply to the other
parts of the aggregate.

  6. Conveying Non-Source Forms.

  You may convey a covered work in object code form under the terms
of sections 4 and 5, provided that you also convey the
machine-readable Corresponding Source under the terms of this License,
in one of these ways:

    a) Convey the object code in, or embodied in, a physical product
    (including a physical distribution medium), accompanied by the
    Corresponding Source fixed on a durable physical medium
    customarily used for software interchange.

    b) Convey the object code in, or embodied in, a physical product
    (including a physical distribution medium), accompanied by a
    written offer, valid for at least three years and valid for as
    long as you offer spare parts or customer support for that product
    model, to give anyone who possesses the object code either (1) a
    copy of the Corresponding Source for all the software in the
    product that is covered by this License, on a durable physical
    medium customarily used for software interchange, for a price no
    more than your reasonable cost of physically performing this
    conveying of source, or (2) access to copy the
    Corresponding Source from a network server at no charge.

    c) Convey individual copies of the object code with a copy of the
    written offer to provide the Corresponding Source.  This
    alternative is allowed only occasionally and noncommercially, and
    only if you received the object code with such an offer, in accord
    with subsection 6b.

    d) Convey the object code by offering access from a designated
    place (gratis or for a charge), and offer equivalent access to the
    Corresponding Source in the same way through the same place at no
    further charge.  You need not require recipients to copy the
    Corresponding Source along with the object code.  If the place to
    copy the object code is a network server, the Corresponding Source
    may be on a different server (operated by you or a third party)
    that supports equivalent copying facilities, provided you maintain
    clear directions next to the object code saying where to find the
    Corresponding Source.  Regardless of what server hosts the
    Corresponding Source, you remain obligated to ensure that it is
    available for as long as needed to satisfy these requirements.

    e) Convey the object code using peer-to-peer transmission, provided
    you inform other peers where the object code and Corresponding
    Source of the work are being offered to the general public at no
    charge under subsection 6d.

  A separable portion of the object code, whose source code is excluded
from the Corresponding Source as a System Library, need not be
included in conveying the object code work.

  A "User Product" is either (1) a "consumer product", which means any
tangible personal property which is normally used for personal, family,
or household purposes, or (2) anything designed or sold for incorporation
into a dwelling.  In determining whether a product is a consumer product,
doubtful cases shall be resolved in favor of coverage.  For a particular
product received by a particular user, "normally used" refers to a
typical or common use of that class of product, regardless of the status
of the particular user or of the way in which the particular user
actually uses, or expects or is expected to use, the product.  A product
is a consumer product regardless of whether the product has substantial
commercial, industrial or non-consumer uses, unless such uses represent
the only significant mode of use of the product.

  "Installation Information" for a User Product means any methods,
procedures, authorization keys, or other information required to install
and execute modified versions of a covered work in that User Product from
a modified version of its Corresponding Source.  The information must
suffice to ensure that the continued functioning of the modified object
code is in no case prevented or interfered with solely because
modification has been made.

  If you convey an object code work under this section in, or with, or
specifically for use in, a User Product, and the conveying occurs as
part of a transaction in which the right of possession and use of the
User Product is transferred to the recipient in perpetuity or for a
fixed term (regardless of how the transaction is characterized), the
Corresponding Source conveyed under this section must be accompanied
by the Installation Information.  But this requirement does not apply
if neither you nor any third party retains the ability to install
modified object code on the User Product (for example, the work has
been installed in ROM).

  The requirement to provide Installation Information does not include a
requirement to continue to provide support service, warranty, or updates
for a work that has been modified or installed by the recipient, or for
the User Product in which it has been modified or installed.  Access to a
network may be denied when the modification itself materially and
adversely affects the operation of the network or violates the rules and
protocols for communication across the network.

  Corresponding Source conveyed, and Installation Information provided,
in accord with this section must be in a format that is publicly
documented (and with an implementation available to the public in
source code form), and must require no special password or key for
unpacking, reading or copying.

  7. Additional Terms.

  "Additional permissions" are terms that supplement the terms of this
License by making exceptions from one or more of its conditions.
Additional permissions that are applicable to the entire Program shall
be treated as though they were included in this License, to the extent
that they are valid under applicable law.  If additional permissions
apply only to part of the Program, that part may be used separately
under those permissions, but the entire Program remains governed by
this License without regard to the additional permissions.

  When you convey a copy of a covered work, you may at your option
remove any additional permissions from that copy, or from any part of
it.  (Additional permissions may be written to require their own
removal in certain cases when you modify the work.)  You may place
additional permissions on material, added by you to a covered work,
for which you have or can give appropriate copyright permission.

  Notwithstanding any other provision of this License, for material you
add to a covered work, you may (if authorized by the copyright holders of
that material) supplement the terms of this License with terms:

    a) Disclaiming warranty or limiting liability differently from the
    terms of sections 15 and 16 of this License; or

    b) Requiring preservation of specified reasonable legal notices or
    author attributions in that material or in the Appropriate Legal
    Notices displayed by works containing it; or

    c) Prohibiting misrepresentation of the origin of that material, or
    requiring that modified versions of such material be marked in
    reasonable ways as different from the original version; or

    d) Limiting the use for publicity purposes of names of licensors or
    authors of the material; or

    e) Declining to grant rights under trademark law for use of some
    trade names, trademarks, or service marks; or

    f) Requiring indemnification of licensors and authors of that
    material by anyone who conveys the material (or modified versions of
    it) with contractual assumptions of liability to the recipient, for
    any liability that these contractual assumptions directly impose on
    those licensors and authors.

  All other non-permissive additional terms are considered "further
restrictions" within the meaning of section 10.  If the Program as you
received it, or any part of it, contains a notice stating that it is
governed by this License along with a term that is a further
restriction, you may remove that term.  If a license document contains
a further restriction but permits relicensing or conveying under this
License, you may add to a covered work material governed by the terms
of that license document, provided that the further restriction does
not survive such relicensing or conveying.

  If you add terms to a covered work in accord with this section, you
must place, in the relevant source files, a statement of the
additional terms that apply to those files, or a notice indicating
where to find the applicable terms.

  Additional terms, permissive or non-permissive, may be stated in the
form of a separately written license, or stated as exceptions;
the above requirements apply either way.

  8. Termination.

  You may not propagate or modify a covered work except as expressly
provided under this License.  Any attempt otherwise to propagate or
modify it is void, and will automatically terminate your rights under
this License (including any patent licenses granted under the third
paragraph of section 11).

  However, if you cease all violation of this License, then your
license from a particular copyright holder is reinstated (a)
provisionally, unless and until the copyright holder explicitly and
finally terminates your license, and (b) permanently, if the copyright
holder fails to notify you of the violation by some reasonable means
prior to 60 days after the cessation.

  Moreover, your license from a particular copyright holder is
reinstated permanently if the copyright holder notifies you of the
violation by some reasonable means, this is the first time you have
received notice of violation of this License (for any work) from that
copyright holder, and you cure the violation prior to 30 days after
your receipt of the notice.

  Termination of your rights under this section does not terminate the
licenses of parties who have received copies or rights from you under
this License.  If your rights have been terminated and not permanently
reinstated, you do not qualify to receive new licenses for the same
material under section 10.

  9. Acceptance Not Required for Having Copies.

  You are not required to accept this License in order to receive or
run a copy of the Program.  Ancillary propagation of a covered work
occurring solely as a consequence of using peer-to-peer transmission
to receive a copy likewise does not require acceptance.  However,
nothing other than this License grants you permission to propagate or
modify any covered work.  These actions infringe copyright if you do
not accept this License.  Therefore, by modifying or propagating a
covered work, you indicate your acceptance of this License to do so.

  10. Automatic Licensing of Downstream Recipients.

  Each time you convey a covered work, the recipient automatically
receives a license from the original licensors, to run, modify and
propagate that work, subject to this License.  You are not responsible
for enforcing compliance by third parties with this License.

  An "entity transaction" is a transaction transferring control of an
organization, or substantially all assets of one, or subdividing an
organization, or merging organizations.  If propagation of a covered
work results from an entity transaction, each party to that
transaction who receives a copy of the work also receives whatever
licenses to the work the party's predecessor in interest had or could
give under the previous paragraph, plus a right to possession of the
Corresponding Source of the work from the predecessor in interest, if
the predecessor has it or can get it with reasonable efforts.

  You may not impose any further restrictions on the exercise of the
rights granted or affirmed under this License.  For example, you may
not impose a license fee, royalty, or other charge for exercise of
rights granted under this License, and you may not initiate litigation
(including a cross-claim or counterclaim in a lawsuit) alleging that
any patent claim is infringed by making, using, selling, offering for
sale, or importing the Program or any portion of it.

  11. Patents.

  A "contributor" is a copyright holder who authorizes use under this
License of the Program or a work on which the Program is based.  The
work thus licensed is called the contributor's "contributor version".

  A contributor's "essential patent claims" are all patent claims
owned or controlled by the contributor, whether already acquired or
hereafter acquired, that would be infringed by some manner, permitted
by this License, of making, using, or selling its contributor version,
but do not include claims that would be infringed only as a
consequence of further modification of the contributor version.  For
purposes of this definition, "control" includes the right to grant
patent sublicenses in a manner consistent with the requirements of
this License.

  Each contributor grants you a non-exclusive, worldwide, royalty-free
patent license under the contributor's essential patent claims, to
make, use, sell, offer for sale, import and otherwise run, modify and
propagate the contents of its contributor version.

  In the following three paragraphs, a "patent license" is any express
agreement or commitment, however denominated, not to enforce a patent
(such as an express permission to practice a patent or covenant not to
sue for patent infringement).  To "grant" such a patent license to a
party means to make such an agreement or commitment not to enforce a
patent against the party.

  If you convey a covered work, knowingly relying on a patent license,
and the Corresponding Source of the work is not available for anyone
to copy, free of charge and under the terms of this License, through a
publicly available network server or other readily accessible means,
then you must either (1) cause the Corresponding Source to be so
available, or (2) arrange to deprive yourself of the benefit of the
patent license for this particular work, or (3) arrange, in a manner
consistent with the requirements of this License, to extend the patent
license to downstream recipients.  "Knowingly relying" means you have
actual knowledge that, but for the patent license, your conveying the
covered work in a country, or your recipient's use of the covered work
in a country, would infringe one or more identifiable patents in that
country that you have reason to believe are valid.

  If, pursuant to or in connection with a single transaction or
arrangement, you convey, or propagate by procuring conveyance of, a
covered work, and grant a patent license to some of the parties
receiving the covered work authorizing them to use, propagate, modify
or convey a specific copy of the covered work, then the patent license
you grant is automatically extended to all recipients of the covered
work and works based on it.

  A patent license is "discriminatory" if it does not include within
the scope of its coverage, prohibits the exercise of, or is
conditioned on the non-exercise of one or more of the rights that are
specifically granted under this License.  You may not convey a covered
work if you are a party to an arrangement with a third party that is
in the business of distributing software, under which you make payment
to the third party based on the extent of your activity of conveying
the work, and under which the third party grants, to any of the
parties who would receive the covered work from you, a discriminatory
patent license (a) in connection with copies of the covered work
conveyed by you (or copies made from those copies), or (b) primarily
for and in connection with specific products or compilations that
contain the covered work, unless you entered into that arrangement,
or that patent license was granted, prior to 28 March 2007.

  Nothing in this License shall be construed as excluding or limiting
any implied license or other defenses to infringement that may
otherwise be available to you under applicable patent law.

  12. No Surrender of Others' Freedom.

  If conditions are imposed on you (whether by court order, agreement or
otherwise) that contradict the conditions of this License, they do not
excuse you from the conditions of this License.  If you cannot convey a
covered work so as to satisfy simultaneously your obligations under this
License and any other pertinent obligations, then as a consequence you may
not convey it at all.  For example, if you agree to terms that obligate you
to collect a royalty for further conveying from those to whom you convey
the Program, the only way you could satisfy both those terms and this
License would be to refrain entirely from conveying the Program.

  13. Use with the GNU Affero General Public License.

  Notwithstanding any other provision of this License, you have
permission to link or combine any covered work with a work licensed
under version 3 of the GNU Affero General Public License into a single
combined work, and to convey the resulting work.  The terms of this
License will continue to apply to the part which is the covered work,
but the special requirements of the GNU Affero General Public License,
section 13, concerning interaction through a network will apply to the
combination as such.

  14. Revised Versions of this License.

  The Free Software Foundation may publish revised and/or new versions of
the GNU General Public License from time to time.  Such new versions will
be similar in spirit to the present version, but may differ in detail to
address new problems or concerns.

  Each version is given a distinguishing version number.  If the
Program specifies that a certain numbered version of the GNU General
Public License "or any later version" applies to it, you have the
option of following the terms and conditions either of that numbered
version or of any later version published by the Free Software
Foundation.  If the Program does not specify a version number of the
GNU General Public License, you may choose any version ever published
by the Free Software Foundation.

  If the Program specifies that a proxy can decide which future
versions of the GNU General Public License can be used, that proxy's
public statement of acceptance of a version permanently authorizes you
to choose that version for the Program.

  Later license versions may give you additional or different
permissions.  However, no additional obligations are imposed on any
author or copyright holder as a result of your choosing to follow a
later version.

  15. Disclaimer of Warranty.

  THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY
APPLICABLE LAW.  EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT
HOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY
OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE.  THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM
IS WITH YOU.  SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF
ALL NECESSARY SERVICING, REPAIR OR CORRECTION.

  16. Limitation of Liability.

  IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING
WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MODIFIES AND/OR CONVEYS
THE PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY
GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE
USE OR INABILITY TO USE THE PROGRAM (INCLUDING BUT NOT LIMITED TO LOSS OF
DATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY YOU OR THIRD
PARTIES OR A FAILURE OF THE PROGRAM TO OPERATE WITH ANY OTHER PROGRAMS),
EVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF
SUCH DAMAGES.

  17. Interpretation of Sections 15 and 16.

  If the disclaimer of warranty and limitation of liability provided
above cannot be given local legal effect according to their terms,
reviewing courts shall apply local law that most closely approximates
an absolute waiver of all civil liability in connection with the
Program, unless a warranty or assumption of liability accompanies a
copy of the Program in return for a fee.

                     END OF TERMS AND CONDITIONS

            How to Apply These Terms to Your New Programs

  If you develop a new program, and you want it to be of the greatest
possible use to the public, the best way to achieve this is to make it
free software which everyone can redistribute and change under these terms.

  To do so, attach the following notices to the program.  It is safest
to attach them to the start of each source file to most effectively
state the exclusion of warranty; and each file should have at least
the "copyright" line and a pointer to where the full notice is found.

    <one line to give the program's name and a brief idea of what it does.>
    Copyright (C) <year>  <name of author>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

Also add information on how to contact you by electronic and paper mail.

  If the program does terminal interaction, make it output a short
notice like this when it starts in an interactive mode:

    <program>  Copyright (C) <year>  <name of author>
    This program comes with ABSOLUTELY NO WARRANTY; for details type `show w'.
    This is free software, and you are welcome to redistribute it
    under certain conditions; type `show c' for details.

The hypothetical commands `show w' and `show c' should show the appropriate
parts of the General Public License.  Of course, your program's commands
might be different; for a GUI interface, you would use an "about box".

  You should also get your employer (if you work as a programmer) or school,
if any, to sign a "copyright disclaimer" for the program, if necessary.
For more information on this, and how to apply and follow the GNU GPL, see
<https://www.gnu.org/licenses/>.

  The GNU General Public License does not permit incorporating your program
into proprietary programs.  If your program is a subroutine library, you
may consider it more useful to permit linking proprietary applications with
the library.  If this is what you want to do, use the GNU Lesser General
Public License instead of this License.  But first, please read
<https://www.gnu.org/licenses/why-not-lgpl.html>.



================================================
FILE: metro.config.js
================================================
/* eslint-disable */

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Needed for https-browsify
config.resolver.extraNodeModules = {
  http: require.resolve("@tradle/react-native-http"),
  url: require.resolve("url"),
  stream: require.resolve("stream-browserify"),
  util: require.resolve("util"),
  events: require.resolve("events"),
};

module.exports = config;



================================================
FILE: package.json
================================================
{
  "name": "vshop",
  "main": "index.ts",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "prebuild:android": "expo prebuild --platform android --clean",
    "prebuild:ios": "expo prebuild --platform ios --clean",
    "run:android": "expo run:android",
    "run:ios": "expo run:ios",
    "lint": "expo lint"
  },
  "jest": {
    "preset": "jest-expo"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.0.2",
    "@react-native-async-storage/async-storage": "1.23.1",
    "@react-native-cookies/cookies": "^6.2.1",
    "@react-navigation/drawer": "^6.7.2",
    "@react-navigation/native": "^6.0.2",
    "@stripe/stripe-react-native": "0.37.2",
    "@tradle/react-native-http": "^2.0.1",
    "axios": "^1.7.7",
    "deepmerge": "^4.3.1",
    "events": "^3.3.0",
    "expo": "~51.0.36",
    "expo-application": "~5.9.1",
    "expo-av": "~14.0.7",
    "expo-battery": "~8.0.1",
    "expo-clipboard": "~6.0.3",
    "expo-constants": "~16.0.2",
    "expo-dev-client": "~4.0.27",
    "expo-device": "~6.0.2",
    "expo-file-system": "~17.0.1",
    "expo-image": "~1.13.0",
    "expo-intent-launcher": "~11.0.1",
    "expo-linking": "~6.3.1",
    "expo-localization": "~15.0.3",
    "expo-network": "~6.0.1",
    "expo-notifications": "~0.28.18",
    "expo-router": "~3.5.23",
    "expo-splash-screen": "~0.27.5",
    "expo-status-bar": "~1.12.1",
    "expo-system-ui": "~3.0.7",
    "expo-web-browser": "~13.0.3",
    "https-browserify": "^1.0.0",
    "i18next": "^23.15.1",
    "jwt-decode": "^4.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-i18next": "^15.0.2",
    "react-native": "0.74.5",
    "react-native-background-fetch": "^4.2.5",
    "react-native-gesture-handler": "~2.16.2",
    "react-native-paper": "^4.12.8",
    "react-native-reanimated": "~3.10.1",
    "react-native-safe-area-context": "4.10.5",
    "react-native-screens": "3.31.1",
    "react-native-web": "~0.19.10",
    "react-native-webview": "13.8.6",
    "recyclerlistview": "^4.2.1",
    "stream-browserify": "^3.0.0",
    "url": "^0.11.4",
    "util": "^0.12.5",
    "zustand": "4.5.5"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "@types/react-test-renderer": "^18.0.7",
    "cross-env": "^7.0.3",
    "eslint": "^8.57.0",
    "eslint-config-expo": "^7.1.2",
    "react-test-renderer": "18.2.0",
    "typescript": "~5.3.3"
  },
  "private": true,
  "packageManager": "pnpm@9.15.4+sha512.b2dc20e2fc72b3e18848459b37359a32064663e5627a51e4c74b2c29dd8e8e0491483c3abb40789cfd578bf362fb6ba8261b05f0387d76792ed6e23ea3b1b6a0"
}



================================================
FILE: tsconfig.json
================================================
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "~/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "./types"
  ]
}



================================================
FILE: .env.example
================================================
EXPO_PUBLIC_API_URL=

# Optional
EXPO_PUBLIC_STRIPE_PUBLIC_KEY=
EXPO_PUBLIC_PLAUSIBLE_URL=
EXPO_PUBLIC_PLAUSIBLE_DOMAIN=


================================================
FILE: .eslintrc.js
================================================
// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
};



================================================
FILE: .npmrc
================================================
node-linker=hoisted



================================================
FILE: app/_layout.tsx
================================================
import { Stack, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Appbar,
  DarkTheme as PaperDarkTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import { StripeProvider } from "@stripe/stripe-react-native";
import merge from "deepmerge";
import {
  DarkTheme as NavigationDarkTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Platform } from "react-native";
import UpdatePopup from "~/components/popups/UpdatePopup";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen } from "expo-router";
import { useTranslation } from "react-i18next";
import { initBackgroundFetch, stopBackgroundFetch } from "~/utils/wishlist";
import { useWishlistStore } from "~/hooks/useWishlistStore";
import PlausibleProvider from "~/components/PlausibleProvider";

export const CombinedDarkTheme = {
  ...merge(PaperDarkTheme, NavigationDarkTheme),
  colors: {
    ...merge(PaperDarkTheme.colors, NavigationDarkTheme.colors),
    primary: "#fa4454",
    accent: "#fa4454",
  },
};

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // "Sync" background fetch with local state
    const notificationEnabled = useWishlistStore.getState().notificationEnabled;
    if (notificationEnabled) {
      initBackgroundFetch();
    } else {
      stopBackgroundFetch();
    }

    // If user has set the region, he *should* be a returning user
    AsyncStorage.getItem("region").then((region) => {
      if (region) {
        router.replace("/reauth");
      } else {
        router.replace("/setup");
      }
      SplashScreen.hideAsync();
    });
  }, [router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PlausibleProvider>
        <SafeAreaView
          style={{ backgroundColor: CombinedDarkTheme.colors.primary }}
        />
        <PaperProvider theme={CombinedDarkTheme}>
          <StripeProvider
            publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY ?? ""}
          >
            <ThemeProvider value={CombinedDarkTheme}>
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: CombinedDarkTheme.colors.primary,
                  },
                  headerTintColor: "#fff",
                  header: ({ options, navigation }) => (
                    <Appbar.Header
                      style={{
                        backgroundColor: CombinedDarkTheme.colors.primary,
                      }}
                    >
                      <Appbar.BackAction onPress={navigation.goBack} />
                      <Appbar.Content title={options.title} />
                    </Appbar.Header>
                  ),
                  gestureEnabled: false,
                }}
              >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="reauth" options={{ headerShown: false }} />
                <Stack.Screen name="setup" options={{ headerShown: false }} />
                <Stack.Screen
                  name="language"
                  options={{ presentation: "modal", title: t("language") }}
                />
                <Stack.Screen
                  name="(authenticated)"
                  options={{ headerShown: false }}
                />
              </Stack>
              {Platform.OS === "android" && <UpdatePopup />}
            </ThemeProvider>
          </StripeProvider>
        </PaperProvider>
      </PlausibleProvider>
    </GestureHandlerRootView>
  );
}

export default RootLayout;



================================================
FILE: app/index.tsx
================================================
import { View } from "react-native";
import Loading from "~/components/Loading";

function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Loading />
    </View>
  );
}

export default Index;



================================================
FILE: app/language.tsx
================================================
import { useNavigation } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { RadioButton } from "react-native-paper";
import { resources } from "~/utils/localization";

function Language() {
  const { i18n, t } = useTranslation();
  const navigation = useNavigation();

  return (
    <ScrollView>
      <RadioButton.Group
        onValueChange={(value) => {
          i18n.changeLanguage(value);
          navigation.goBack();
        }}
        value={i18n.language}
      >
        {Object.keys(resources).map((lang) => (
          <RadioButton.Item
            key={lang}
            label={`${t(`languages.${lang}`)} (${lang})`}
            value={lang}
          />
        ))}
      </RadioButton.Group>
    </ScrollView>
  );
}

export default Language;



================================================
FILE: app/reauth.tsx
================================================
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Paragraph, Title } from "react-native-paper";

import LoginWebView from "~/components/LoginWebView";

function ReAuth() {
  const { t } = useTranslation();

  return (
    <View style={{ padding: 20, height: "100%", width: "100%" }}>
      <Title style={{ fontSize: 25, fontWeight: "bold", color: "#fff" }}>
        {t("welcome_back")}
      </Title>
      <Paragraph style={{ marginBottom: 10 }}>
        {t("welcome_back_info")}
      </Paragraph>
      <LoginWebView />
    </View>
  );
}

export default ReAuth;



================================================
FILE: app/setup.tsx
================================================
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, SafeAreaView, ScrollView, View } from "react-native";
import {
  Button,
  Paragraph,
  RadioButton,
  Title,
  useTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import { regions } from "~/utils/misc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserStore } from "~/hooks/useUserStore";
import LoginWebView from "~/components/LoginWebView";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

function Setup() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [offsetX, setOffsetX] = useState(0);
  const { t } = useTranslation();
  const { user, setUser } = useUserStore();
  const { colors } = useTheme();

  return (
    <>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={scrollViewRef}
        scrollEnabled={false}
        onMomentumScrollEnd={(event) =>
          setOffsetX(event.nativeEvent.contentOffset.x)
        }
      >
        <View
          style={{
            justifyContent: "space-evenly",
            width: windowWidth,
          }}
        >
          <Image
            style={{
              height: "70%",
              width: windowWidth,
            }}
            contentFit="contain"
            source={require("~/assets/images/mockup.png")}
          />
          <View
            style={{
              flexDirection: "column",
              width: windowWidth,
              marginHorizontal: 20,
            }}
          >
            <Title style={{ fontSize: 25, fontWeight: "bold", color: "#fff" }}>
              {t("welcome")}
            </Title>
            <Paragraph>{t("promotional")}</Paragraph>
          </View>
        </View>
        <View
          style={{
            width: windowWidth,
            height: windowHeight,
            padding: 20,
          }}
        >
          <Title style={{ fontSize: 25, fontWeight: "bold", color: "#fff" }}>
            {t("region")}
          </Title>
          <Paragraph style={{ color: "orange", marginBottom: 10 }}>
            {t("region_info")}
          </Paragraph>
          <RadioButton.Group
            onValueChange={(value) => {
              setUser({ ...user, region: value });
              AsyncStorage.setItem("region", value);
            }}
            value={user.region}
          >
            {regions.map((region) => (
              <RadioButton.Item
                key={region}
                label={`${t(`regions.${region}`)} (${region.toUpperCase()})`}
                value={region}
              />
            ))}
          </RadioButton.Group>
        </View>
        {user.region.length > 0 && (
          <View
            style={{
              width: windowWidth,
              height: windowHeight,
            }}
          >
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 20,
                maxHeight: "15%",
              }}
            >
              <Title
                style={{ fontSize: 25, fontWeight: "bold", color: "#fff" }}
              >
                {t("signin")}
              </Title>
              <Paragraph style={{ marginBottom: 10 }}>
                {t("signin_info")}
              </Paragraph>
            </View>
            <LoginWebView />
          </View>
        )}
      </ScrollView>
      <View>
        <View style={{ flexDirection: "row" }}>
          <Button
            onPress={() => {
              const x = offsetX - windowWidth;
              scrollViewRef.current?.scrollTo({
                x,
                animated: true,
              });
              setOffsetX(x);
            }}
            style={{ width: "50%" }}
            disabled={Math.round(offsetX) === 0}
          >
            {t("back")}
          </Button>
          <Button
            onPress={() => {
              const x = offsetX + windowWidth;
              scrollViewRef.current?.scrollTo({
                x,
                animated: true,
              });
              setOffsetX(x);
            }}
            style={{ width: "50%" }}
            disabled={
              Math.round(offsetX / windowWidth) === 2 ||
              (Math.round(offsetX / windowWidth) === 1 &&
                user.region.length <= 0)
            }
          >
            {t("next")}
          </Button>
        </View>
      </View>
      <SafeAreaView style={{ backgroundColor: colors.background }} />
    </>
  );
}

export default Setup;



================================================
FILE: app/(authenticated)/_layout.tsx
================================================
import { Drawer } from "expo-router/drawer";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { Platform, View } from "react-native";
import { DrawerItemList } from "@react-navigation/drawer";
import { Appbar, Text, useTheme } from "react-native-paper";
import * as Application from "expo-application";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import MediaPopup from "~/components/popups/MediaPopup";
import DonatePopup from "~/components/popups/DonatePopup";

function CustomDrawerContent(props: any) {
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          paddingVertical: 20,
        }}
      >
        <Image
          style={{
            width: 50,
            height: 50,
            borderRadius: 10,
            marginRight: 10,
          }}
          source={require("~/assets/images/logo-50.png")}
        />
        <View>
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>VShop</Text>
          <Text style={{ fontSize: 12 }}>
            v{Application.nativeApplicationVersion}
          </Text>
        </View>
      </View>
      <DrawerItemList {...props} />
    </>
  );
}

function Layout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          header: ({ options, navigation }) => (
            <Appbar.Header style={{ backgroundColor: colors.primary }}>
              <Appbar.Action icon="menu" onPress={navigation.openDrawer} />
              <Appbar.Content title={options.title} />
            </Appbar.Header>
          ),
        }}
      >
        <Drawer.Screen
          name="bundles"
          options={{
            title: t("bundles"),
            drawerIcon: ({ color, size }) => (
              <Icon name="package" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="shop"
          options={{
            title: t("shop"),
            drawerIcon: ({ color, size }) => (
              <Icon name="basket" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="accessories"
          options={{
            title: t("accessories"),
            drawerIcon: ({ color, size }) => (
              <Icon name="anchor" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="night_market"
          options={{
            title: t("nightmarket"),
            drawerIcon: ({ color, size }) => (
              <Icon name="weather-night" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            title: t("profile"),
            drawerIcon: ({ color, size }) => (
              <Icon name="account" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="gallery"
          options={{
            title: t("gallery"),
            drawerIcon: ({ color, size }) => (
              <Icon name="camera-burst" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: t("settings"),
            drawerIcon: ({ color, size }) => (
              <Icon name="cog" color={color} size={size} />
            ),
          }}
        />
      </Drawer>
      <MediaPopup />
      {Platform.OS === "android" && <DonatePopup />}
    </>
  );
}

export default Layout;



================================================
FILE: app/(authenticated)/accessories.tsx
================================================
import React from "react";
import { ScrollView, View } from "react-native";
import Countdown from "~/components/Countdown";
import { useUserStore } from "~/hooks/useUserStore";
import ShopAccessoryItem from "~/components/ShopAccessoryItem";

function AccessoryShop() {
  const user = useUserStore((state) => state.user);
  const timestamp = new Date().getTime() + user.shops.remainingSecs.accessory * 1000;

  return (
    <>
      <ScrollView>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignContent: "center",
            paddingVertical: 5,
            paddingHorizontal: 10,
          }}
        >
            <Countdown timestamp={timestamp} />
        </View>
        {user.shops.accessory.map((item) => (
          <ShopAccessoryItem item={item} key={item.uuid} />
        ))}
      </ScrollView>
    </>
  );
}

export default AccessoryShop;



================================================
FILE: app/(authenticated)/bundles.tsx
================================================
import React from "react";
import { ScrollView, View } from "react-native";
import { Text } from "react-native-paper";
import BundleImage from "~/components/BundleImage";
import BundleItem from "~/components/BundleItem";
import { useUserStore } from "~/hooks/useUserStore";
import Icon from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";

function Bundles() {
  const { t } = useTranslation();
  const user = useUserStore(({ user }) => user);

  return user.shops.bundles.length !== 0 ? (
    <ScrollView>
      {user.shops.bundles.map((bundle, i) => (
        <View key={bundle.uuid}>
          <BundleImage
            bundle={bundle}
            remainingSecs={user.shops.remainingSecs.bundles[i]}
          />
          {bundle.items.map((item, i) => (
            <BundleItem item={item} key={item.uuid} />
          ))}
        </View>
      ))}
    </ScrollView>
  ) : (
    <View
      style={{
        flex: 1,
        alignContent: "center",
        justifyContent: "center",
      }}
    >
      <Icon
        style={{ textAlign: "center" }}
        name="question-mark"
        size={80}
        color="#fff"
      />
      <Text
        style={{
          textAlign: "center",
          fontSize: 14,
          marginTop: 10,
        }}
      >
        {t("no_bundle")}
      </Text>
    </View>
  );
}

export default Bundles;



================================================
FILE: app/(authenticated)/gallery.tsx
================================================
import React from "react";
import { Searchbar } from "react-native-paper";
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from "recyclerlistview";
import { Dimensions } from "react-native";
import { useWishlistStore } from "~/hooks/useWishlistStore";
import GalleryItem from "~/components/GalleryItem";
import { getAssets } from "~/utils/valorant-assets";

function useDebounceValue(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function Gallery() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedQuery = useDebounceValue(searchQuery, 100);
  const [gallerySkins, setGallerySkins] = React.useState<GalleryItem[]>([]);
  const galleryDataProvider = new DataProvider((r1, r2) => {
    return r1.uuid !== r2.uuid;
  }).cloneWithRows(gallerySkins);
  const { skinIds, toggleSkin } = useWishlistStore();

  React.useEffect(() => {
    setGallerySkins(
      getAssets()
        .skins.filter(
          (skin) =>
            skin.displayName.match(
              new RegExp(
                debouncedQuery.replace(/[&/\\#,+()$~%.^'":*?<>{}]/g, ""),
                "i"
              )
            ) && skin.contentTierUuid
        )
        .map((item) => ({
          ...item,
          onWishlist: skinIds.includes(item.levels[0].uuid),
        }))
        .sort((a, b) =>
          a.onWishlist === b.onWishlist ? 0 : a.onWishlist ? -1 : 1
        )
    );
  }, [debouncedQuery, skinIds]);

  const rowRenderer = (
    type: string | number,
    data: GalleryItem,
    index: number
  ) => <GalleryItem item={data} toggleFromWishlist={toggleSkin} />;

  return (
    <>
      <Searchbar
        placeholder="Search"
        onChangeText={(value) => setSearchQuery(value)}
        value={searchQuery}
        style={{ margin: 5 }}
      />
      {galleryDataProvider.getSize() > 0 && (
        <RecyclerListView
          rowRenderer={rowRenderer}
          dataProvider={galleryDataProvider}
          layoutProvider={
            new LayoutProvider(
              () => 0,
              (type, dim) => {
                dim.width = Dimensions.get("window").width;
                dim.height = 69;
              }
            )
          }
        />
      )}
    </>
  );
}

export default Gallery;



================================================
FILE: app/(authenticated)/night_market.tsx
================================================
import React from "react";
import { ScrollView, View } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { useUserStore } from "~/hooks/useUserStore";
import Countdown from "~/components/Countdown";
import NightMarketItem from "~/components/NightMarketItem";

function NightMarket() {
  const { t } = useTranslation();
  const user = useUserStore(({ user }) => user);
  const timestamp =
    new Date().getTime() + user.shops.remainingSecs.nightMarket * 1000;

  return (
    <>
      {user.shops.nightMarket.length > 0 ? (
        <ScrollView>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignContent: "center",
              paddingVertical: 5,
              paddingHorizontal: 10,
            }}
          >
            <Countdown timestamp={timestamp} />
          </View>
          {user.shops.nightMarket.map((item) => (
            <NightMarketItem item={item} key={item.uuid} />
          ))}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            style={{ textAlign: "center" }}
            name="weather-night"
            size={80}
            color="#fff"
          />
          <Text
            style={{
              textAlign: "center",
              fontSize: 14,
              marginTop: 10,
            }}
          >
            {t("no_nightmarket")}
          </Text>
        </View>
      )}
    </>
  );
}

export default NightMarket;



================================================
FILE: app/(authenticated)/profile.tsx
================================================
import React from "react";
import { ScrollView, View } from "react-native";
import { Avatar, List, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useUserStore } from "~/hooks/useUserStore";
import CurrencyIcon from "~/components/CurrencyIcon";

function Profile() {
  const user = useUserStore(({ user }) => user);
  const { t } = useTranslation();

  return (
    <ScrollView style={{ padding: 10 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 15,
        }}
      >
        <Avatar.Text size={48} label={user.name.slice(0, 2).toUpperCase()} />
        <Text style={{ marginLeft: 10, fontSize: 30, fontWeight: "bold" }}>
          {user.name}
        </Text>
      </View>
      <List.Section title={t("info")}>
        <List.Item
          title={t("region")}
          description={t(`regions.${user.region}`)}
          left={(props) => <List.Icon {...props} icon="earth" />}
        />
      </List.Section>
      <List.Section title={t("progress")}>
        <List.Item
          title={t("level")}
          description={user.progress.level}
          left={(props) => <List.Icon {...props} icon="chevron-triple-up" />}
        />
        <List.Item
          title={t("xp")}
          description={user.progress.xp}
          left={(props) => <List.Icon {...props} icon="chevron-triple-up" />}
        />
      </List.Section>
      <List.Section title={t("balances")}>
        <List.Item
          title={t("vp")}
          description={user.balances.vp.toString()}
          descriptionNumberOfLines={1}
          left={(props) => <CurrencyIcon {...props} icon="vp" paper />}
        />
        <List.Item
          title={t("rad")}
          description={user.balances.rad.toString()}
          descriptionNumberOfLines={1}
          left={(props) => <CurrencyIcon {...props} icon="rad" paper />}
        />
        <List.Item
          title={t("kc")}
          description={user.balances.kc.toString()}
          descriptionNumberOfLines={1}
          left={(props) => <CurrencyIcon {...props} icon="kc" paper />}
        />
        <List.Item
          title={t("fag")}
          description={user.balances.fag.toString()}
          descriptionNumberOfLines={1}
          left={(props) => <List.Icon {...props} icon="account-supervisor" />}
        />
      </List.Section>
    </ScrollView>
  );
}

export default Profile;



================================================
FILE: app/(authenticated)/settings.tsx
================================================
import React from "react";
import { Checkbox, List, Text, TouchableRipple } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { Linking, ToastAndroid, ScrollView } from "react-native";
import CookieManager from "@react-native-cookies/cookies";
import { Platform } from "react-native";
import { useUserStore } from "~/hooks/useUserStore";
import { useFeatureStore } from "~/hooks/useFeatureStore";
import { useDonatePopupStore } from "~/components/popups/DonatePopup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultUser } from "~/utils/valorant-api";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import {
  checkShop,
  initBackgroundFetch,
  stopBackgroundFetch,
} from "~/utils/wishlist";
import * as Notifications from "expo-notifications";
import { useWishlistStore } from "~/hooks/useWishlistStore";
import BatteryOptimizationWarning from "~/components/BatteryOptimizationWarning";

function Settings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const { isDonator, screenshotModeEnabled, toggleScreenshotMode } =
    useFeatureStore();
  const notificationEnabled = useWishlistStore(
    (state) => state.notificationEnabled
  );
  const setNotificationEnabled = useWishlistStore(
    (state) => state.setNotificationEnabled
  );
  const wishlistedSkins = useWishlistStore((state) => state.skinIds);
  const { showDonatePopup } = useDonatePopupStore();

  const handleLogout = async () => {
    await CookieManager.clearAll(true);
    await AsyncStorage.removeItem("region");
    setUser(defaultUser);
    stopBackgroundFetch();
    setNotificationEnabled(false);
    router.replace("/setup");
  };

  const toggleNotificationEnabled = async () => {
    if (isDonator) {
      if (!notificationEnabled) {
        const permission = await Notifications.requestPermissionsAsync();
        if (permission.granted) {
          await initBackgroundFetch();
          setNotificationEnabled(true);
          ToastAndroid.show(
            t("wishlist.notification.enabled"),
            ToastAndroid.LONG
          );
        } else {
          ToastAndroid.show(
            t("wishlist.notification.no_permission"),
            ToastAndroid.LONG
          );
        }
      } else {
        await stopBackgroundFetch();
        setNotificationEnabled(false);
        ToastAndroid.show(
          t("wishlist.notification.disabled"),
          ToastAndroid.LONG
        );
      }
    } else {
      showDonatePopup();
    }
  };

  const showLastExecution = async () => {
    const lastWishlistCheck = await AsyncStorage.getItem("lastWishlistCheck");
    const ms = Number.parseInt(lastWishlistCheck || "0");
    if (ms > 0) {
      const hours = Math.floor((new Date().getTime() - ms) / 1000 / 60 / 60);
      const minutes = Math.floor((new Date().getTime() - ms) / 1000 / 60);
      ToastAndroid.show(
        `Last checked: ${
          hours === 0 ? `${minutes} minutes` : `${hours} hours`
        } ago`,
        ToastAndroid.LONG
      );
    } else {
      ToastAndroid.show("Never checked", ToastAndroid.LONG);
    }
  };

  return (
    <ScrollView>
      <BatteryOptimizationWarning />
      <List.Section title={t("general")}>
        <TouchableRipple
          onPress={() => {
            router.navigate("/language");
          }}
        >
          <List.Item
            title={t("language")}
            left={(props) => <List.Icon {...props} icon="translate" />}
          />
        </TouchableRipple>
        {Platform.OS === "android" && (
          <>
            <TouchableRipple
              onPress={toggleNotificationEnabled}
              onLongPress={showLastExecution}
            >
              <List.Item
                title={t("wishlist.notification.name")}
                description={t("wishlist.notification.info")}
                left={(props) => (
                  <List.Icon {...props} icon="cellphone-message" />
                )}
                right={() => (
                  <Checkbox
                    status={notificationEnabled ? "checked" : "unchecked"}
                    onPress={toggleNotificationEnabled}
                  />
                )}
              />
            </TouchableRipple>
            <TouchableRipple disabled={isDonator} onPress={showDonatePopup}>
              <List.Item
                title={t("donate")}
                description={
                  isDonator && (
                    <Text style={{ color: "green" }}>
                      {t("donate_unlocked")}
                    </Text>
                  )
                }
                left={(props) => <List.Icon {...props} icon="hand-coin" />}
              />
            </TouchableRipple>
          </>
        )}
      </List.Section>
      <List.Section title={t("links")}>
        <TouchableRipple
          onPress={() => Linking.openURL("https://vshop.one/discord")}
        >
          <List.Item
            title={t("discord_server")}
            left={(props) => <List.Icon {...props} icon="link" />}
          />
        </TouchableRipple>
        <TouchableRipple
          onPress={() => Linking.openURL("https://vshop.one/credits")}
        >
          <List.Item
            title={t("credits")}
            left={(props) => <List.Icon {...props} icon="link" />}
          />
        </TouchableRipple>
        <TouchableRipple
          onPress={() => Linking.openURL("https://vshop.one/privacy")}
        >
          <List.Item
            title={t("privacy_policy")}
            left={(props) => <List.Icon {...props} icon="link" />}
          />
        </TouchableRipple>
        <TouchableRipple
          onPress={() =>
            Linking.openURL(
              "https://support-valorant.riotgames.com/hc/en-us/articles/360050328414-Deleting-Your-Riot-Account-and-All-Your-Data"
            )
          }
        >
          <List.Item
            title={t("delete_account")}
            left={(props) => <List.Icon {...props} icon="link" />}
          />
        </TouchableRipple>
      </List.Section>
      <List.Section title={t("account")}>
        <TouchableRipple onPress={() => Clipboard.setStringAsync(user.id)}>
          <List.Item
            title={t("copy_riot_id")}
            left={(props) => <List.Icon {...props} icon="content-copy" />}
          />
        </TouchableRipple>
        <TouchableRipple onPress={handleLogout}>
          <List.Item
            title={t("logout")}
            left={(props) => <List.Icon {...props} icon="logout" />}
          />
        </TouchableRipple>
      </List.Section>
      {__DEV__ && (
        <List.Section title="Development">
          <TouchableRipple onPress={toggleScreenshotMode}>
            <List.Item
              title={t("screenshot_mode")}
              left={(props) => (
                <List.Icon {...props} icon="cellphone-screenshot" />
              )}
              right={() => (
                <Checkbox
                  status={screenshotModeEnabled ? "checked" : "unchecked"}
                  onPress={toggleScreenshotMode}
                />
              )}
            />
          </TouchableRipple>
          <TouchableRipple onPress={() => checkShop(wishlistedSkins)}>
            <List.Item
              title="Wishlist notification test"
              left={(props) => (
                <List.Icon {...props} icon="cellphone-message" />
              )}
            />
          </TouchableRipple>
        </List.Section>
      )}

      <Text
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "gray",
          marginTop: 5,
          paddingHorizontal: 15,
        }}
      >
        VShop is not endorsed by Riot Games in any way.
        {"\n"}
        Riot Games, Valorant, and all associated properties are trademarks or
        registered trademarks of Riot Games, Inc.
      </Text>
    </ScrollView>
  );
}

export default Settings;



================================================
FILE: app/(authenticated)/shop.tsx
================================================
import React from "react";
import { ScrollView, View } from "react-native";
import Countdown from "~/components/Countdown";
import ShopItem from "~/components/ShopItem";
import { useUserStore } from "~/hooks/useUserStore";

function Shop() {
  const user = useUserStore((state) => state.user);
  const timestamp = new Date().getTime() + user.shops.remainingSecs.main * 1000;

  return (
    <>
      <ScrollView>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignContent: "center",
            paddingVertical: 5,
            paddingHorizontal: 10,
          }}
        >
          <Countdown timestamp={timestamp} />
        </View>
        {user.shops.main.map((item) => (
          <ShopItem item={item} key={item.uuid} />
        ))}
      </ScrollView>
    </>
  );
}

export default Shop;



================================================
FILE: assets/i18n/ar.json
================================================
{
  "account": "الحِسَاب",
  "balances": "رَصِيدُكَ",
  "bundles": "الحِزَمُ",
  "credits": "الفَضْلُ إِلَى",
  "credits_techchrism": "وَثَائِقُ API فَالُورَنْت",
  "credits_valorantapi": "وَثَائِقُ API فَالُورَنْت غَيرُ الرَسْمِيَّةِ",
  "delete_account": "حَذْفُ الحِسَابِ",
  "discord_server": "خَادِمُ الدِّيسْكُور",
  "donate": "تبرع",
  "fag": "عملاء مجانيون",
  "fetching.balances": "جاري جلب الأرصدة…",
  "fetching.entitlements_token": "جار جلب الرمز…",
  "fetching.offers": "جار جلب العروض…",
  "fetching.progress": "جارٍ جلب التقدم…",
  "fetching.storefront": "جار جلب واجهة المحل…",
  "fetching.user_id": "جار جلب معرف المستخدم…",
  "fetching.username": "جار جلب اسم المستخدم…",
  "info": "مَعْلُومَات",
  "language": "اللغه",
  "languages.ar": "العربية",
  "languages.de": "الألمانية",
  "languages.en": "الانجليزية",
  "languages.fr": "الفرنسية",
  "languages.it": "إيطالي",
  "languages.jp": "اليابانية",
  "languages.ko": "الكورية",
  "languages.pl": "البولندية",
  "languages.pt": "البرتغالية",
  "languages.ru": "الروسية",
  "languages.th": "التايلاندية",
  "languages.tr": "التركية",
  "languages.vi": "فيتنامي",
  "languages.zh-Hans": "الصينية المبسطة",
  "languages.zh-Hant": "تقاليد صينية",
  "links": "الرابط",
  "login": "تَسْجِيلُ الدُخُولِ",
  "logout": "تَسْجِيلُ الخُرُوجِ",
  "nightmarket": "المَتْجَرُ اللَّيْلِي",
  "no_nightmarket": "المَتْجَرُ اللَّيْلِيُّ سَيَعُودُ قَرِيبًا.",
  "privacy_policy": "سِيَاسَةُ الخُصُوصِيَّةِ",
  "progress": "التَقَدُّمْ",
  "promotional": "تَحَقَّقْ مِنْ مَتْجَرِكَ فِي أَيِّ مَكَانٍ، و فِي أَيِّ زَمَانٍ.",
  "rad": "نقاط راديانيت",
  "region": "المِنْطَقَة",
  "regions.ap": "آسيا",
  "regions.eu": "أوروبا",
  "regions.kr": "Korea",
  "regions.na": "أمريكا الشمالية",
  "separate": "مُنْفَصِلَةٌ",
  "settings": "الاعدادات",
  "shop": "المَتْجَرُ",
  "signin": "سَجِّلْ الدُخُولَ بِمُعَرَّفِ Riot",
  "translators": "المترجمون",
  "videos": "أشرطة فيديو",
  "vp": "نقاط VP",
  "welcome": "مَرْحَبًا بِكَ فِي VShop",
  "xp": "النِقَاطْ"
}



================================================
FILE: assets/i18n/de.json
================================================
{
  "accessories": "Accessoires-Shop",
  "account": "Konto",
  "amount": "Betrag",
  "back": "zurück",
  "balances": "Guthaben",
  "battery_optimization_warning": {
    "action": "Deaktivieren der Batterieoptimierung",
    "description": "Die Batterieoptimierung ist für VShop aktiviert. Dies kann dazu führen, dass Benachrichtigungen nicht ordnungsgemäß funktionieren."
  },
  "bundles": "Bündel",
  "chromas": "Chromas",
  "copy_riot_id": "Riot-Konto-ID kopieren",
  "credits": "Credits",
  "credits_techchrism": "Valorant API Dokumentation",
  "credits_valorantapi": "inoffizielle Valorant API",
  "delete_account": "Konto löschen",
  "discord_server": "Discord Server",
  "donate": "Spenden",
  "donate_msg": "Unterstütze die Entwicklung und erhalte Zugang zu Wunschlisten-Benachrichtigungen, indem du einen beliebigen Betrag spendest. Vielen Dank <3",
  "donate_unlocked": "Du hast Spendervorteile freigeschaltet.",
  "fag": "Gratis Agenten",
  "fetching": {
    "assets": "Lade Inhalte…",
    "donator": "Lade Spenderstatus…"
  },
  "fetching.balances": "Lade Bilanzen…",
  "fetching.entitlements_token": "Lade Berechtigungstoken…",
  "fetching.offers": "Lade Angebote…",
  "fetching.progress": "Lade Fortschritt…",
  "fetching.storefront": "Lade Shop…",
  "fetching.user_id": "Lade Benutzer-ID…",
  "fetching.username": "Lade Benutzername…",
  "gallery": "Galerie",
  "general": "Allgemein",
  "info": "Info",
  "invalid_amount": "Ungültiger Betrag",
  "kc": "Kingdom-Credits",
  "language": "Sprache",
  "languages": {
    "es": "Spanisch",
    "no": "Norwegisch",
    "uk": "Ukrainisch"
  },
  "languages.ar": "Arabisch",
  "languages.de": "Deutsch",
  "languages.en": "Englisch",
  "languages.fr": "Französisch",
  "languages.it": "Italienisch",
  "languages.jp": "Japanisch",
  "languages.ko": "Koreanisch",
  "languages.pl": "Polnisch",
  "languages.pt": "Portugiesisch",
  "languages.ru": "Russisch",
  "languages.th": "Thailändisch",
  "languages.tr": "Türkisch",
  "languages.vi": "Vietnamesisch",
  "languages.zh-Hans": "Chinesisch (Vereinfacht)",
  "languages.zh-Hant": "Chinesisch (Traditionell)",
  "level": "Level",
  "levels": "Level",
  "links": "Links",
  "login": "Anmelden",
  "logout": "Abmelden",
  "minimum_amount": "Der Mindestbetrag ist {{amount}}",
  "never_show_again": "Nicht mehr anzeigen",
  "next": "Weiter",
  "nightmarket": "Nachtmarkt",
  "no": "Nein danke",
  "no_nightmarket": "Der Nachtmarkt kommt bald wieder zurück.",
  "okay": "Okay",
  "privacy_policy": "Datenschutzerklärung",
  "profile": "Profil",
  "progress": "Fortschritt",
  "promotional": "Sehe deinen Valorant Shop überall, zu jeder Zeit.",
  "purchase": {
    "error": "Ein Fehler ist aufgetreten",
    "success": "Deine Bestellung wird bearbeitet. Ein Neustart der App ist erforderlich, um deine Vorteile zu sehen."
  },
  "rad": "Radianite Punkte",
  "region": "Region",
  "region_info": "Bitte achte darauf, dass du die richtige Region auswählst, sonst wird dein Shop nicht übereinstimmen.",
  "regions.ap": "Asien-Pazifik",
  "regions.eu": "Europa",
  "regions.kr": "Korea",
  "regions.na": "Nordamerika",
  "screenshot_mode": "Screenshot-Modus",
  "separate": "separat",
  "settings": "Einstellungen",
  "shop": "Shop",
  "signin": "Mit Riot-ID anmelden",
  "signin_info": "Deine Anmeldedaten werden direkt an Riot Games gesendet.",
  "translators": "Übersetzer",
  "update": {
    "available": {
      "description": "Eine neuere Version von VShop steht zum Download bereit",
      "title": "Update verfügbar"
    },
    "download_github": "Auf GitHub herunterladen"
  },
  "videos": "Videos",
  "vp": "Valorant Punkte",
  "welcome": "Willkommen bei VShop",
  "welcome_back": "Willkommen zurück",
  "welcome_back_info": "Bleibe dran, während wir dich wieder anmelden.",
  "wishlist": {
    "add": "Zur Wunschliste hinzufügen",
    "name": "Wunschliste",
    "notification": {
      "disabled": "Benachrichtigungen deaktiviert",
      "enabled": "Benachrichtigungen aktiviert",
      "error": "Bei der Überprüfung deines Shops ist ein Fehler aufgetreten",
      "hit": "{{displayname}} ist in deinem Shop!",
      "info": "Erhalte eine Benachrichtigung, wenn dein Wunschartikel im Shop ist.",
      "name": "Wunschliste Benachrichtigung",
      "no_hit": "Heute kein Glück: Kein Skin auf der Wunschliste ist in deinem Shop.",
      "no_permission": "Wir haben nicht die Erlaubnis, dir Benachrichtigungen zu schicken!"
    },
    "remove": "Von Wunschliste entfernen"
  },
  "xp": "XP"
}



================================================
FILE: assets/i18n/en.json
================================================
{
  "account": "Account",
  "amount": "Amount",
  "back": "back",
  "balances": "Balances",
  "battery_optimization_warning": {
    "action": "Disable battery optimization",
    "description": "Battery optimization is enabled for VShop. This may prevent wishlist notifications from working properly."
  },
  "bundles": "Bundles",
  "chromas": "Chromas",
  "copy_riot_id": "Copy Riot Account ID",
  "credits": "Credits",
  "credits_techchrism": "Valorant API documentation",
  "credits_valorantapi": "unofficial Valorant API",
  "delete_account": "Delete Account",
  "discord_server": "Discord Server",
  "donate": "Donate",
  "donate_msg": "Support the development and get access to Wishlist Notifications by donating any amount. Thanks a lot <3",
  "donate_unlocked": "You've unlocked donator perks.",
  "fag": "Free Agents",
  "fetching": {
    "assets": "Fetching assets…",
    "balances": "Fetching balances…",
    "donator": "Fetching donator status…",
    "entitlements_token": "Fetching entitlements token…",
    "offers": "Fetching offers…",
    "progress": "Fetching progress…",
    "storefront": "Fetching storefront…",
    "user_id": "Fetching user id…",
    "username": "Fetching username…"
  },
  "gallery": "Gallery",
  "general": "General",
  "info": "Info",
  "invalid_amount": "Invalid amount",
  "minimum_amount": "Minimum amount is {{amount}}",
  "language": "Language",
  "languages": {
    "ar": "Arabic",
    "de": "German",
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "it": "Italian",
    "jp": "Japanese",
    "ko": "Korean",
    "no": "Norwegian",
    "pl": "Polish",
    "pt": "Portuguese",
    "ru": "Russian",
    "ta": "Tamil",
    "th": "Thai",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "vi": "Vietnamese",
    "zh-Hans": "Chinese Simplified",
    "zh-Hant": "Chinese Traditional"
  },
  "level": "Level",
  "levels": "Levels",
  "links": "Links",
  "login": "Login",
  "logout": "Logout",
  "never_show_again": "Don't show again",
  "next": "Next",
  "nightmarket": "Night Market",
  "no": "No thanks",
  "no_nightmarket": "The Night Market will return soon.",
  "no_bundle": "There is no bundle available at the moment.\nPlease check back later.",
  "okay": "Okay",
  "privacy_policy": "Privacy Policy",
  "profile": "Profile",
  "progress": "Progress",
  "promotional": "See your Valorant shop anywhere, anytime.",
  "purchase": {
    "error": "An error occurred",
    "success": "Your order is processing. An app restart may be required to see your perks."
  },
  "rad": "Radianite Points",
  "region": "Region",
  "region_info": "Please make sure you select the correct region, otherwise your shop will be inaccurate.",
  "regions": {
    "ap": "Asia-Pacific",
    "eu": "Europe",
    "kr": "Korea",
    "na": "North America"
  },
  "screenshot_mode": "Screenshot Mode",
  "separate": "separate",
  "settings": "Settings",
  "shop": "Shop",
  "signin": "Sign In with Riot ID",
  "signin_info": "Your login details will be sent directly to Riot Games.",
  "translators": "Translators",
  "update": {
    "available": {
      "description": "A newer version of VShop is available to download",
      "title": "Update available"
    },
    "download_github": "Download on GitHub"
  },
  "videos": "Videos",
  "vp": "Valorant Points",
  "welcome": "Welcome to VShop",
  "welcome_back": "Welcome back",
  "welcome_back_info": "Sit tight, while we log you back in.",
  "wishlist": {
    "add": "Add to wishlist",
    "name": "Wishlist",
    "notification": {
      "disabled": "Notifications disabled",
      "enabled": "Notifications enabled",
      "error": "An error occurred while checking your shop",
      "hit": "The {{displayname}} is in your Shop!",
      "info": "Get a notication when your wishlisted item is in the shop.",
      "name": "Wishlist Notification",
      "no_hit": "No luck today: No wishlisted skin is in your shop.",
      "no_permission": "We don't have permission to send you notifications!"
    },
    "remove": "Remove from wishlist"
  },
  "xp": "XP",
  "accessories": "Accessory Shop",
  "kc": "Kingdom Credits"
}


================================================
FILE: assets/i18n/es.json
================================================
{
  "accessories": "Tienda de accesorios",
  "account": "Cuenta",
  "amount": "Importe",
  "back": "atrás",
  "balances": "Balances",
  "battery_optimization_warning": {
    "action": "Desactivar la optimización de la batería",
    "description": "La optimización de la batería está activada para VShop. Esto puede impedir que las notificaciones de la lista de deseos funcionen correctamente."
  },
  "bundles": "Paquetes",
  "chromas": "Colores y estilos",
  "copy_riot_id": "Copiar el ID de cuenta de Riot",
  "credits": "Créditos",
  "credits_techchrism": "Documentación de la API de Valorant",
  "credits_valorantapi": "API no oficial de Valorant",
  "delete_account": "Eliminar cuenta",
  "discord_server": "Servidor de Discord",
  "donate": "Donar",
  "donate_msg": "Apoya el desarrollo y obtén acceso a las Notificaciones de la Lista de Deseos donando cualquier cantidad. Muchas gracias <3",
  "donate_unlocked": "Has desbloqueado ventajas de donante.",
  "fag": "Agentes gratis",
  "fetching": {
    "assets": "Obteniendo activos…",
    "donator": "Cargando estado del donante…"
  },
  "fetching.balances": "Cargando balances…",
  "fetching.entitlements_token": "Cargando el token de derechos…",
  "fetching.offers": "Cargando ofertas…",
  "fetching.progress": "Cargando progreso…",
  "fetching.storefront": "Cargando tienda…",
  "fetching.user_id": "Cargando ID de usuario…",
  "fetching.username": "Cargando nombre de usuario…",
  "gallery": "Galería",
  "general": "General",
  "info": "Información",
  "invalid_amount": "El importe mínimo es {{amount}}.",
  "kc": "Créditos del reino",
  "language": "Idioma",
  "languages": {
    "es": "Español",
    "no": "Noruego",
    "uk": "Ucraniano"
  },
  "languages.ar": "Árabe",
  "languages.de": "Alemán",
  "languages.en": "Inglés",
  "languages.fr": "Francés",
  "languages.it": "Italiano",
  "languages.jp": "Japonés",
  "languages.ko": "Coreano",
  "languages.pl": "Polaco",
  "languages.pt": "Portugués",
  "languages.ru": "Ruso",
  "languages.th": "Tailandés",
  "languages.tr": "Turco",
  "languages.vi": "Vietnamita",
  "languages.zh-Hans": "Chino simplificado",
  "languages.zh-Hant": "Chino Tradicional",
  "level": "Nivel",
  "levels": "Niveles",
  "links": "Enlaces",
  "login": "Iniciar sesión",
  "logout": "Cerrar sesión",
  "never_show_again": "No mostrar de nuevo",
  "next": "Siguiente",
  "nightmarket": "Mercado nocturno",
  "no": "No, gracias",
  "no_nightmarket": "El Mercado nocturno volverá pronto.",
  "okay": "Entendido",
  "privacy_policy": "Política de privacidad",
  "profile": "Perfil",
  "progress": "Progreso",
  "promotional": "Mira tu tienda de Valorant donde quieras, cuando quieras.",
  "purchase": {
    "error": "Se ha producido un error",
    "success": "Tu pedido se está procesando. Es posible que tengas que reiniciar la aplicación para ver tus ventajas."
  },
  "rad": "Radianita",
  "region": "Región",
  "region_info": "Por favor, asegúrate de seleccionar la región correcta, de lo contrario tu tienda será inexacta.",
  "regions.ap": "Asia Pacífico",
  "regions.eu": "Europa",
  "regions.kr": "Corea",
  "regions.na": "América del Norte",
  "screenshot_mode": "Modo de captura de pantalla",
  "separate": "separado",
  "settings": "Ajustes",
  "shop": "Tienda",
  "signin": "Inicia sesión con el ID de Riot",
  "signin_info": "Tus datos de acceso se enviarán directamente a Riot Games.",
  "translators": "Traductores",
  "update": {
    "available": {
      "description": "Está disponible para descargar una versión más nueva de VShop",
      "title": "Actualización disponible"
    },
    "download_github": "Descargar en GitHub"
  },
  "videos": "Videos",
  "vp": "Puntos de Valorant",
  "welcome": "Bienvenido a VShop",
  "welcome_back": "Bienvenido de nuevo",
  "welcome_back_info": "Siéntese mientras te volvemos a registrar.",
  "wishlist": {
    "add": "Añadir a la lista de deseos",
    "name": "Lista de deseos",
    "notification": {
      "disabled": "Notificaciones deshabilitadas",
      "enabled": "Notificaciones habilitadas",
      "error": "Se ha producido un error al comprobar tu tienda",
      "hit": "¡La {{displayname}} está en la tienda!",
      "info": "Recibe una notificación cuando el artículo de tu lista de deseos esté en la tienda.",
      "name": "Notificación de la lista de deseos",
      "no_hit": "Hoy no ha habido suerte: No hay ningún skin en tu tienda.",
      "no_permission": "¡No tenemos permiso para enviarte notificaciones!"
    },
    "remove": "Eliminar de la lista de deseos"
  },
  "xp": "XP"
}



================================================
FILE: assets/i18n/fr.json
================================================
{
  "accessories": "Boutique d'accessoires",
  "account": "Compte",
  "amount": "Montant",
  "back": "Retournez",
  "balances": "Soldes",
  "battery_optimization_warning": {
    "action": "Désactiver l’optimisation de la batterie",
    "description": "L’optimisation de la batterie est activée pour VShop. Cela pourrait empêcher le bon fonctionnement des notifications de la liste de souhaits."
  },
  "bundles": "Paquets",
  "chromas": "Couleurs",
  "copy_riot_id": "Copier l'ID du compte Riot",
  "credits": "Crédits",
  "credits_techchrism": "Documentation d'API de Valorant",
  "credits_valorantapi": "API inofficielle de Valorant",
  "delete_account": "Supprimer le compte",
  "discord_server": "Serveur de Discord",
  "donate": "Faire un don",
  "donate_msg": "Vous pouvez soutenir le développement en cours en devenant donateur, et obtenez l'accès aux Notifications de Wishlist. Merci beaucoup <3",
  "donate_unlocked": "Vous avez obtenu les avantages du donateur.",
  "fag": "Agents gratuits",
  "fetching": {
    "assets": "Chargement des ressources…",
    "donator": "Récupération du statut de donateur…"
  },
  "fetching.balances": "Récupération des soldes…",
  "fetching.entitlements_token": "Récupération du jeton de droits…",
  "fetching.offers": "Récupération des offres…",
  "fetching.progress": "Récupération du progrès…",
  "fetching.storefront": "Récupération de la devanture…",
  "fetching.user_id": "Récupération de l'identifiant…",
  "fetching.username": "Récupération du nom d'utilisateur…",
  "gallery": "Galerie",
  "general": "Général",
  "info": "Info",
  "invalid_amount": "Montant invalide",
  "kc": "Crédits Kingdom",
  "language": "Langue",
  "languages": {
    "es": "Espagnol",
    "no": "Norvégien",
    "uk": "Ukrainien"
  },
  "languages.ar": "Arabe",
  "languages.de": "Allemand",
  "languages.en": "Anglais",
  "languages.fr": "Français",
  "languages.it": "Italien",
  "languages.jp": "Japonais",
  "languages.ko": "Coréen",
  "languages.pl": "Polonais",
  "languages.pt": "Portugais",
  "languages.ru": "Russe",
  "languages.th": "Thaïlandais",
  "languages.tr": "Turc",
  "languages.vi": "Vietnamien",
  "languages.zh-Hans": "Chinois simplifié",
  "languages.zh-Hant": "Chinois traditionnel",
  "level": "Niveau",
  "levels": "Niveaux",
  "links": "Liens",
  "login": "Se connecter",
  "logout": "Se déconnecter",
  "minimum_amount": "Le montant minimum est de {{amount}}",
  "never_show_again": "Ne plus afficher",
  "next": "Suivant",
  "nightmarket": "Marché de nuit",
  "no": "Non merci",
  "no_nightmarket": "Le marché de nuit sera bientôt de retour.",
  "okay": "D'accord",
  "privacy_policy": "Politique de confidentialité",
  "profile": "Profil",
  "progress": "Progrès",
  "promotional": "Voyez votre magasin de Valorant n'importe où, n'importe quand.",
  "purchase": {
    "error": "Une erreur s'est produite",
    "success": "Merci d'avoir soutenu VShop. Profitez de vos avantages."
  },
  "rad": "Points de Radianite",
  "region": "Région",
  "region_info": "Veuillez assurer que vous avez choisi la bonne région, sinon votre boutique sera incorrecte.",
  "regions": {
    "eu": "Europe"
  },
  "regions.ap": "Asie-pacifique",
  "regions.kr": "Corée",
  "regions.na": "Amérique du Nord",
  "screenshot_mode": "Mode capture d'écran",
  "separate": "séparé",
  "settings": "Paramètres",
  "shop": "Boutique",
  "signin": "Se connecter avec Riot ID",
  "signin_info": "Vos détails de connexion seront envoyés directement au Riot Games.",
  "translators": "Traducteurs",
  "update": {
    "available": {
      "description": "Une nouvelle version de VShop est disponible",
      "title": "Mise à jour disponible"
    },
    "download_github": "Télécharger sur GitHub"
  },
  "videos": "Vidéos",
  "vp": "Points Valorant",
  "welcome": "Bienvenue à VShop",
  "welcome_back": "Content de vous revoir",
  "welcome_back_info": "En train de vous reconnecter.",
  "wishlist": {
    "add": "Ajouter à Wishlist",
    "name": "Liste de souhaites (Wishlist)",
    "notification": {
      "disabled": "Notifications désactivées",
      "enabled": "Notifications activées",
      "error": "Une erreur est arrivé lorsqu'on regarde votre boutique",
      "hit": "Le {{displayname}} est dans votre boutique !",
      "info": "Recevoir une notification lorsque les articles de votre Wishlist sont dans votre boutique.",
      "name": "Les notifications de Wishlist",
      "no_hit": "Pas de chance aujourd'hui : Aucun skin de Wishlist est dans votre boutique.",
      "no_permission": "Nous n'avons pas la permission de vous envoyer des notifications!"
    },
    "remove": "Supprimer de Wishlist"
  },
  "xp": "XP"
}



================================================
FILE: assets/i18n/it.json
================================================
{
  "accessories": "Negozio Accessori",
  "account": "Account",
  "amount": "Quantità",
  "back": "Indietro",
  "balances": "Bilancio",
  "battery_optimization_warning": {
    "action": "Disabilità l'ottimizzazione della batteria",
    "description": "L'ottimizzazione della batteria è attiva per VShop. Questo potrebbe prevenire il corretto funzionamento delle notifiche."
  },
  "bundles": "Bundle",
  "chromas": "Colori",
  "copy_riot_id": "Copia l'ID dell'Account Riot",
  "credits": "Crediti",
  "credits_techchrism": "Documentazione Valorant API",
  "credits_valorantapi": "Valorant API non ufficiale",
  "delete_account": "Elimina l'account",
  "discord_server": "Server Discord",
  "donate": "Dona",
  "donate_msg": "Supporta il Developer, donando ogni cifra ed avrai accesso alle notifiche riguardanti la tua wishlist. Grazie Mille <3",
  "donate_unlocked": "Hai sbloccato i vantaggi da donatore.",
  "fag": "Agenti Gratis",
  "fetching": {
    "assets": "Recupero gli assests…",
    "donator": "Recupero stato donatore…"
  },
  "fetching.balances": "Recupero saldi…",
  "fetching.entitlements_token": "Recupero del token dei diritti in corso…",
  "fetching.offers": "Recuperando le offerte attuali …",
  "fetching.progress": "Recupero dei progressi…",
  "fetching.storefront": "Recupero vetrina…",
  "fetching.user_id": "Recuperando l' ID utente…",
  "fetching.username": "Recuperando l'username…",
  "gallery": "Galleria",
  "general": "Generale",
  "info": "Informazioni",
  "invalid_amount": "Quantità non valida",
  "kc": "Crediti Kingdom",
  "language": "Lingua",
  "languages": {
    "es": "Spagnolo",
    "no": "Norvegese",
    "uk": "Ucraino"
  },
  "languages.ar": "Arabo",
  "languages.de": "Tedesco",
  "languages.en": "Inglese",
  "languages.fr": "Francese",
  "languages.it": "Italiano",
  "languages.jp": "Giapponese",
  "languages.ko": "Coreano",
  "languages.pl": "Polacco",
  "languages.pt": "Portoghese",
  "languages.ru": "Russo",
  "languages.th": "Thailandese",
  "languages.tr": "Turco",
  "languages.vi": "Vietnamese",
  "languages.zh-Hans": "Cinese semplificato",
  "languages.zh-Hant": "Cinese tradizionale",
  "level": "Livello",
  "levels": "Livelli",
  "links": "Collegamenti",
  "login": "Accedi",
  "logout": "disconnettersi",
  "minimum_amount": "La quantità minima è {{amount}}",
  "never_show_again": "Non mostrare più",
  "next": "Prossimo",
  "nightmarket": "Mercato notturno",
  "no": "No grazie",
  "no_nightmarket": "Il mercato notturno tornerà presto.",
  "okay": "Ok",
  "privacy_policy": "Politica Sulla Riservatezza",
  "profile": "Profilo",
  "progress": "Progressi",
  "promotional": "Controlla il tuo negozio del gioco Valorant sempre e ovunque.",
  "purchase": {
    "error": "Un errore è apparso",
    "success": "Grazie per aver supportato VShop.Goditi i vantaggi."
  },
  "rad": "Punti Radianite",
  "region": "Regione",
  "region_info": "Per favore, assicurati di aver impostato la regione corretta , senno' il tuo negozio sara' incorretto.",
  "regions.ap": "Asia-Pacifica",
  "regions.eu": "Europa",
  "regions.kr": "Corea",
  "regions.na": "Nord America",
  "screenshot_mode": "Modalità Screenshot",
  "separate": "Separatamente",
  "settings": "Impostazioni",
  "shop": "Negozio",
  "signin": "Accedi con il tuo Riot ID",
  "signin_info": "Le tue credenziali saranno mandate direttamente a Riot Games.",
  "translators": "Traduttori",
  "update": {
    "available": {
      "description": "Una nuova versione di VShop è disponibile per il download",
      "title": "Aggiornamento disponibile"
    },
    "download_github": "Scarica da GitHub"
  },
  "videos": "Video",
  "vp": "Punti Valore",
  "welcome": "Benvenuto in VShop",
  "welcome_back": "Bentornato",
  "welcome_back_info": "Aspetta, stiamo provando a farti accedere.",
  "wishlist": {
    "add": "Aggiungi alla wishlist",
    "name": "Wishlist/ lista dei desideri",
    "notification": {
      "disabled": "Notifiche disattivate",
      "enabled": "Notifiche attive",
      "error": "Un errore è apparso nel mentre che controllavamo il tuo shop",
      "hit": "Il {{display name}} è ora nel tuo negozio!",
      "info": "Ricevi una notifica quando il tuo oggetto desiderato sarà nel negozio.",
      "name": "Notifica della Wishlist",
      "no_hit": "Nessuna fortuna oggi: Nessun oggetto desiderato è nel negozio.",
      "no_permission": "Non abbiamo il permesso di inviarti notifiche!"
    },
    "remove": "Rimuovi dalla wishlist"
  },
  "xp": "Punti Esperienza"
}



================================================
FILE: assets/i18n/jp.json
================================================
{
  "account": "アカウント",
  "balances": "残高",
  "bundles": "バンドル",
  "credits": "クレジット",
  "credits_techchrism": "ヴァロラント アピ ドキュメント",
  "credits_valorantapi": "非公式の Valorant API",
  "delete_account": "アカウントを削除する",
  "discord_server": "不和サーバー",
  "donate": "寄付",
  "fag": "自由契約選手",
  "fetching.balances": "残高を取得しています…",
  "fetching.entitlements_token": "資格トークンを取得しています…",
  "fetching.offers": "クーポンを取得しています…",
  "fetching.progress": "進行状況を取得しています…",
  "fetching.storefront": "ストアフロントを取得しています…",
  "fetching.user_id": "ユーザー ID を取得しています…",
  "fetching.username": "ユーザー名を取得しています…",
  "info": "情報",
  "language": "言語",
  "languages.ar": "アラビア語",
  "languages.de": "ドイツ人",
  "languages.en": "英語",
  "languages.fr": "フランス語",
  "languages.it": "イタリアの",
  "languages.jp": "日本",
  "languages.ko": "韓国語",
  "languages.pl": "研磨",
  "languages.pt": "ポルトガル語",
  "languages.ru": "ロシア",
  "languages.th": "タイ語",
  "languages.tr": "トルコ語",
  "languages.vi": "ベトナム語",
  "languages.zh-Hans": "中国語（簡体字",
  "languages.zh-Hant": "中国の伝統的な",
  "links": "リンク",
  "login": "ログイン",
  "logout": "ログアウト",
  "nightmarket": "夜市",
  "no_nightmarket": "ナイトマーケットはすぐに戻ってきます。",
  "privacy_policy": "プライバシーポリシー",
  "progress": "進捗",
  "promotional": "いつでもどこでも ヴァロラント ショップをご覧ください。",
  "rad": "ラディアナイト ポイント",
  "region": "領域",
  "regions.ap": "アジア太平洋地域",
  "regions.eu": "ヨーロッパ",
  "regions.kr": "韓国",
  "regions.na": "北米",
  "separate": "分ける",
  "settings": "設定",
  "shop": "店",
  "signin": "ライアットIDでサインイン",
  "translators": "翻訳者",
  "videos": "動画",
  "vp": "バロラントポイント",
  "welcome": "Vショップへようこそ",
  "xp": "xp"
}



================================================
FILE: assets/i18n/ko.json
================================================
{
  "accessories": "엑세서리 상점",
  "account": "계정",
  "amount": "후원",
  "back": "돌아가기",
  "balances": "잔액",
  "battery_optimization_warning": {
    "action": "배터리 설정 비활성화",
    "description": "배터리 설정이 활성화 되어있습니다.이 설정은 찜 목록 알림이 작동하는데 문제가 생길수 있습니다."
  },
  "bundles": "세트",
  "chromas": "변형",
  "copy_riot_id": "라이엇 아이디 복사",
  "credits": "크레딧",
  "credits_techchrism": "발로란트 API 문서",
  "credits_valorantapi": "비공식 발로란트 API",
  "delete_account": "계정 삭제",
  "discord_server": "디스코드 커뮤니티",
  "donate": "후원",
  "donate_msg": "개발자에게 후원하고 찜 목록 안내를 받아보세요<3",
  "donate_unlocked": "후원 특전이 해금 되었습니다.",
  "fag": "무료 요원",
  "fetching": {
    "assets": "에셋 불러오는중…",
    "donator": "후원자 상태 불러오는중…"
  },
  "fetching.balances": "잔액 불러오는 중…",
  "fetching.entitlements_token": "자격 토큰 불러오는 중…",
  "fetching.offers": "주문 불러오는 중…",
  "fetching.progress": "진행도 불러오는 중…",
  "fetching.storefront": "상점 불러오는 중…",
  "fetching.user_id": "유저 ID 가져오는 중…",
  "fetching.username": "유저 이름 가져오는 중…",
  "gallery": "갤러리",
  "general": "일반",
  "info": "정보",
  "invalid_amount": "잘못된 금액",
  "kc": "킹덤 크레딧",
  "language": "언어",
  "languages": {
    "es": "스페인어",
    "no": "노르웨이어",
    "uk": "우크라이나어"
  },
  "languages.ar": "아랍어",
  "languages.de": "독일어",
  "languages.en": "영어",
  "languages.fr": "프랑스어",
  "languages.it": "이탈리아어",
  "languages.jp": "일본어",
  "languages.ko": "한국어",
  "languages.pl": "폴란드어",
  "languages.pt": "포르투갈어",
  "languages.ru": "러시아어",
  "languages.th": "태국어",
  "languages.tr": "터키어",
  "languages.vi": "베트남어",
  "languages.zh-Hans": "중국어 간체",
  "languages.zh-Hant": "중국어 번체",
  "level": "레벨",
  "levels": "레벨",
  "links": "링크",
  "login": "로그인",
  "logout": "로그아웃",
  "minimum_amount": "최소 후원금은 {{amount}}입니다",
  "never_show_again": "다시 보지 않기",
  "next": "다음",
  "nightmarket": "야시장",
  "no": "아뇨 괜찮습니다",
  "no_nightmarket": "야시장은 곧 돌아옵니다.",
  "okay": "확인",
  "privacy_policy": "개인정보 보호 정책",
  "profile": "프로필",
  "progress": "진행도",
  "promotional": "언제, 어디서든 발로란트 상점을 확인하세요.",
  "purchase": {
    "error": "오류가 발생했습니다",
    "success": "VShop을 지원해주셔서 감사합니다."
  },
  "rad": "레디어나이트 포인트",
  "region": "지역",
  "region_info": "올바른 지역을 선택하세요,올바르지 않은 지역을 선택 시에는 상점이 달라질 수 있습니다.",
  "regions.ap": "아시아 - 태평양",
  "regions.eu": "유럽",
  "regions.kr": "한국",
  "regions.na": "북아메리카",
  "screenshot_mode": "스크린샷 모드",
  "separate": "단품 구매시 가격",
  "settings": "설정",
  "shop": "오늘의 상점",
  "signin": "라이엇 ID로 로그인",
  "signin_info": "로그인 세부 정보는 라이엇 게임즈에게 직접 전송됩니다.",
  "translators": "번역가",
  "update": {
    "available": {
      "description": "새로운 버전의 Vshop을 다운로드 할 수 있습니다",
      "title": "업데이트 가능"
    },
    "download_github": "GitHub에서 다운로드"
  },
  "videos": "동영상",
  "vp": "발로란트 포인트",
  "welcome": "VShop에 오신 것을 환영합니다",
  "welcome_back": "다시 오신 것을 환영합니다",
  "welcome_back_info": "다시 로그인 하는 동안 잠시 기다려 주세요.",
  "wishlist": {
    "add": "찜 목록에 추가하기",
    "name": "찜 목록",
    "notification": {
      "disabled": "알림 비활성화",
      "enabled": "알림 활성화",
      "error": "상점을 확인하는 중 오류가 발생했습니다",
      "hit": "{{displayname}} 상품이 상점에 등장했습니다!",
      "info": "찜 해놓은 상품이 상점에 나온다면 알림을 받습니다.",
      "name": "찜 목록 알림",
      "no_hit": "운이 없군요 :v 찜 해놓은 상품이 상점에 없습니다.",
      "no_permission": "알림을 보내기 위한 권한이 없습니다!"
    },
    "remove": "찜 목록에서 삭제하기"
  },
  "xp": "경험치"
}



================================================
FILE: assets/i18n/no.json
================================================
{
  "account": "Konto",
  "amount": "Beløp",
  "back": "Tilbake",
  "balances": "Kontobalanser",
  "bundles": "Samlepakker",
  "chromas": "Farger",
  "copy_riot_id": "Kopier Riot-konto-ID",
  "credits": "Bidragsytere",
  "credits_techchrism": "Valorant-API-dokumentasjon",
  "credits_valorantapi": "uoffisielt Valorant-API",
  "delete_account": "Slett konto",
  "discord_server": "Discord-tjener",
  "donate": "Doner",
  "donate_msg": "Støtt utviklingen med hva som helst og få tilgang til ønskelistemerknader. Takk <3",
  "donate_unlocked": "Du har låst opp donasjonsbegunstninger.",
  "fag": "Gratisagenter",
  "fetching": {
    "balances": "Henter kontobalanser …",
    "donator": "Henter donasjonsstatus …",
    "entitlements_token": "Henter berettighetssymbol …",
    "offers": "Henter tilbud …",
    "progress": "Henter fremdrift …",
    "storefront": "Henter butikkfront …",
    "user_id": "Henter bruker-ID …",
    "username": "Henter brukernavn …"
  },
  "gallery": "Galleri",
  "general": "Generelt",
  "info": "Info",
  "invalid_amount": "Minimumsbeløpet er {{amount}}.",
  "language": "Språk",
  "languages": {
    "ar": "Arabisk",
    "de": "Tysk",
    "en": "Engelsk",
    "es": "Spansk",
    "fr": "Fransk",
    "it": "Italiensk",
    "jp": "Japansk",
    "ko": "Koreansk",
    "pl": "Polsk",
    "pt": "Portugisisk",
    "ru": "Russisk",
    "th": "Thai",
    "tr": "Tyrkisk",
    "vi": "Vietnamesisk",
    "zh-Hans": "Forenklet kinesisk",
    "zh-Hant": "Tradisjonell kinesisk"
  },
  "level": "Nivå",
  "levels": "Nivåer",
  "links": "Lenker",
  "login": "Logg inn",
  "logout": "Logg ut",
  "never_show_again": "Ikke vis igjen",
  "next": "Neste",
  "nightmarket": "Nattmarked",
  "no": "Nei takk",
  "no_nightmarket": "Nattmarkedet kommer tilbake snart.",
  "okay": "OK",
  "privacy_policy": "Personvernspraksis",
  "profile": "Profil",
  "progress": "Framdrift",
  "promotional": "Sjekk din Valorant-butikk når som helst, hvor som helst.",
  "purchase": {
    "error": "En feil inntraff",
    "success": "Behandler bestillingen din … Omstart av programmet kreves for å se kjøpet."
  },
  "rad": "Radanite-poeng",
  "region": "Region",
  "region_info": "Velg riktig sted, ellers vises butikken unøyaktig.",
  "regions": {
    "ap": "Stillehavet",
    "eu": "Europa",
    "kr": "Korea",
    "na": "Nordamerika"
  },
  "screenshot_mode": "Skjermavbildningsmodus",
  "separate": "egen",
  "settings": "Innstillinger",
  "shop": "Butikk",
  "signin": "Logg inn med Riot-ID",
  "signin_info": "Dine innloggingsdetaljer sendes direkte til Riot Games.",
  "translators": "Oversettere",
  "update": {
    "available": {
      "description": "En nyere versjon av VShop kan lastes ned",
      "title": "Oppgradering tilgjengelig"
    },
    "download_github": "Last ned på GitHub"
  },
  "videos": "Videoer",
  "vp": "Valorant-poeng",
  "welcome": "Velkommen til VShop",
  "welcome_back": "Velkommen tilbake",
  "welcome_back_info": "Logger inn igjen.",
  "wishlist": {
    "add": "Legg til på ønskelisten",
    "name": "Ønskeliste",
    "notification": {
      "disabled": "Merknader avskrudd",
      "enabled": "Merknader påskrudd",
      "error": "Kunne ikke sjekke butikken din",
      "hit": "{{displayname}} er i butikken din!",
      "info": "Få en merknad når noe på ønskelisten er i butikken.",
      "name": "Ønskeliste-merknad",
      "no_hit": "Lykke til neste gang. Ingen drakter på ønskelisten i butikken din.",
      "no_permission": "Mangler tilgang til å sende deg merknader!"
    },
    "remove": "Fjern fra ønskelisten"
  },
  "xp": "Erfaringspoeng"
}



================================================
FILE: assets/i18n/pl.json
================================================
{
  "account": "Konto",
  "amount": "Kwota",
  "back": "powrót",
  "balances": "Balansy",
  "bundles": "Pakiety",
  "chromas": "Malowania",
  "copy_riot_id": "Skopiuj identyfikator konta Riot",
  "credits": "Twórcy",
  "credits_techchrism": "Dokumentacja Valorant API",
  "credits_valorantapi": "nieoficjalne Valorant API",
  "delete_account": "Usuń konto",
  "discord_server": "Serwer Discord",
  "donate": "Dotacja",
  "donate_msg": "Wesprzyj rozwój i uzyskaj dostęp do powiadomień o liście życzeń, przekazując dowolną kwotę. Wielkie dzięki <3",
  "donate_unlocked": "Odblokowałeś gratisy wspierającego.",
  "fag": "Darmowi Agenci",
  "fetching": {
    "donator": "Pobieranie statusu dawcy…"
  },
  "fetching.balances": "Pobieranie sald…",
  "fetching.entitlements_token": "Pobieranie tokenu uprawnień…",
  "fetching.offers": "Pobieranie ofert…",
  "fetching.progress": "Pobieranie postępów…",
  "fetching.storefront": "Pobieranie sklepu…",
  "fetching.user_id": "Pobieranie identyfikatora użytkownika…",
  "fetching.username": "Pobieranie nicku…",
  "gallery": "Galeria",
  "general": "Główny",
  "info": "Informacje",
  "invalid_amount": "Minimalna kwota to {{amount}}.",
  "language": "Języki",
  "languages": {
    "es": "Hiszpański"
  },
  "languages.ar": "Arabski",
  "languages.de": "Niemiecki",
  "languages.en": "Angielski",
  "languages.fr": "Francuski",
  "languages.it": "Włoski",
  "languages.jp": "Japoński",
  "languages.ko": "Koreański",
  "languages.pl": "Polski",
  "languages.pt": "Portugalski",
  "languages.ru": "Rosyjski",
  "languages.th": "Tajlandzki",
  "languages.tr": "Turecki",
  "languages.vi": "Wietnamski",
  "languages.zh-Hans": "Chiński Uproszczony",
  "languages.zh-Hant": "Chiński Tradycyjny",
  "level": "Poziom",
  "levels": "Poziomy",
  "links": "Linki",
  "login": "Logowanie",
  "logout": "Wyloguj się",
  "never_show_again": "Nie pokazuj ponownie",
  "next": "następny",
  "nightmarket": "Nocny Rynek",
  "no": "nie, dziekuje",
  "no_nightmarket": "Nocny Rynek powróci wkrótce.",
  "okay": "Ok",
  "privacy_policy": "Polityka prywatności",
  "profile": "Profil",
  "progress": "Postęp",
  "promotional": "Zobacz swój sklep Valorant gdziekolwiek, kiedykolwiek.",
  "purchase": {
    "error": "Wystąpił błąd",
    "success": "Twoje zamówienie jest przetwarzane. Aby zobaczyć swoje bonusy, wymagane jest ponowne uruchomienie aplikacji."
  },
  "rad": "Punkty Promienitu",
  "region": "Region",
  "region_info": "Upewnij się, że wybierasz właściwy region, w przeciwnym razie Twój sklep będzie niedokładny.",
  "regions.ap": "Azja-Pacyfik",
  "regions.eu": "Europa",
  "regions.kr": "Korea",
  "regions.na": "Ameryka Północna",
  "screenshot_mode": "Tryb zrzutu ekranu",
  "separate": "oddziel",
  "settings": "Ustawienia",
  "shop": "Sklep",
  "signin": "Zaloguj się przy użyciu ID Riot",
  "signin_info": "Twoje dane logowania zostaną przesłane bezpośrednio do Riot Games.",
  "translators": "Tłumacze",
  "update": {
    "available": {
      "description": "Nowsza wersja VShop jest dostępna do pobrania",
      "title": "Dostępna aktualizacja"
    },
    "download_github": "Pobierz na GitHubie"
  },
  "videos": "Filmy",
  "vp": "Punkty Valorant",
  "welcome": "Witaj w VShop",
  "welcome_back": "Witaj ponownie",
  "welcome_back_info": "Siedź spokojnie, a my zalogujemy Cię ponownie.",
  "wishlist": {
    "add": "Dodaj do listy życzeń",
    "name": "Lista życzeń",
    "notification": {
      "disabled": "Powiadomienia wyłączone",
      "enabled": "Powiadomienia włączone",
      "error": "Wystąpił błąd podczas sprawdzania Twojego sklepu",
      "hit": "{{displayname}} jest w Twoim sklepie!",
      "info": "Otrzymaj powiadomienie, gdy przedmiot z listy życzeń znajdzie się w sklepie.",
      "name": "Powiadomienie z listy życzeń",
      "no_hit": "Dzisiaj nie masz szczęścia: w Twoim sklepie nie ma żadnej skórki z listy życzeń.",
      "no_permission": "Nie mamy uprawnień do wysyłania Ci powiadomień!"
    },
    "remove": "Usuń z listy życzeń"
  },
  "xp": "XP"
}



================================================
FILE: assets/i18n/pt.json
================================================
{
  "accessories": "Loja de acessórios",
  "account": "Conta",
  "amount": "Quantidade",
  "back": "Voltar",
  "balances": "Balanços",
  "battery_optimization_warning": {
    "action": "Desativar a otimização da bateria",
    "description": "A otimização da bateria está ativada para VShop. Isso pode impedir que as notificações da lista de desejos funcionem corretamente."
  },
  "bundles": "Pacotes",
  "copy_riot_id": "Copiar ID da Conta Riot",
  "credits": "Créditos",
  "credits_techchrism": "Documentação API de Valorant",
  "credits_valorantapi": "não-oficial Valorant API",
  "delete_account": "Apagar conta",
  "discord_server": "Servidor de Discord",
  "donate": "Doar",
  "donate_unlocked": "Você desbloqueou vantagens de doador.",
  "fag": "Agentes livres",
  "fetching.balances": "Buscando equilíbrios…",
  "fetching.entitlements_token": "Ficha de direitos de busca…",
  "fetching.offers": "Ofertas interessantes…",
  "fetching.progress": "Obtendo seu progresso…",
  "fetching.storefront": "Obtendo a fachada da loja…",
  "fetching.user_id": "Obtendo o ID do usuário…",
  "fetching.username": "Obtendo seu nome de usuário…",
  "gallery": "Galeria",
  "general": "Geral",
  "info": "Informação",
  "invalid_amount": "Quantidade inválida",
  "kc": "Créditos Kingdom",
  "language": "Língua",
  "languages": {
    "es": "Espanhol"
  },
  "languages.ar": "Arábico",
  "languages.de": "Alemão",
  "languages.en": "Inglês",
  "languages.fr": "Francês",
  "languages.it": "Italiano",
  "languages.jp": "Japonês",
  "languages.ko": "Coreano",
  "languages.pl": "Polonês",
  "languages.pt": "Português",
  "languages.ru": "Russo",
  "languages.th": "Tailandês",
  "languages.tr": "Turco",
  "languages.vi": "Viatnamês",
  "languages.zh-Hans": "Chinês Simplificado",
  "languages.zh-Hant": "Tradicional Chinês",
  "levels": "Níveis",
  "links": "Links",
  "login": "Login",
  "logout": "Sair da conta",
  "minimum_amount": "A quantidade mínima é {{amount}}",
  "never_show_again": "Não mostrar novamente",
  "next": "Próximo",
  "nightmarket": "Mercado Noturno",
  "no": "Não, obrigado",
  "no_nightmarket": "O Mercado Noturno estará de volta em breve.",
  "okay": "Ok",
  "privacy_policy": "Política de Privacidade",
  "profile": "Perfil",
  "progress": "Progresso",
  "promotional": "Veja sua loja Valorant em qualquer lugar, a qualquer hora.",
  "purchase": {
    "error": "Ocorreu um erro",
    "success": "Seu pedido está processando. Uma reinicialização do aplicativo pode ser necessária para ver suas vantagens."
  },
  "rad": "Pontos de Radianite",
  "region": "Região",
  "region_info": "Verifique se selecionou a região correta caso contrário sua loja será imprecisa.",
  "regions.ap": "Ásia-Pacífico",
  "regions.eu": "Europa",
  "regions.kr": "Coréia",
  "regions.na": "América do Norte",
  "screenshot_mode": "Modo de captura de tela",
  "separate": "separe",
  "settings": "Configurações",
  "shop": "Loja",
  "signin": "Faça o login com o Riot ID",
  "signin_info": "Seus detalhes de login será enviado diretamente a Riot Games.",
  "translators": "Tradutores",
  "update": {
    "available": {
      "description": "Uma nova versão do VShop está disponível para download",
      "title": "Atualização disponível"
    },
    "download_github": "Baixar no GitHub"
  },
  "videos": "Vídeos",
  "vp": "Pontos de Valorant",
  "welcome": "Bem-vindo à VShop",
  "welcome_back": "Bem vindo novamente",
  "wishlist": {
    "add": "Adicionar a lista de desejos",
    "name": "Lista de desejos",
    "notification": {
      "disabled": "Notificações desativadas",
      "enabled": "Notificações ativadas",
      "error": "Ocorreu um erro ao verificar sua loja",
      "hit": "{{displayname}} está em sua loja!",
      "info": "Ativar notificação quando seu item na lista de desejos estiver na loja.",
      "name": "Notificações da lista de desejos"
    },
    "remove": "Remover da lista de desejos"
  },
  "xp": "XP"
}



================================================
FILE: assets/i18n/ro.json
================================================
{}



================================================
FILE: assets/i18n/ru.json
================================================
{
  "accessories": "Магазин аксессуаров",
  "account": "Аккаунт",
  "amount": "Количество",
  "back": "назад",
  "balances": "Баланс",
  "battery_optimization_warning": {
    "action": "Отключить оптимизацию заряда батареи",
    "description": "Для VShop включена оптимизация батареи. Это может помешать работе уведомлений списка желаний."
  },
  "bundles": "Коллекции",
  "chromas": "Расцветки",
  "copy_riot_id": "Скопировать ID аккаунта Riot",
  "credits": "Авторы",
  "credits_techchrism": "Документация Valorant API",
  "credits_valorantapi": "неофициальный Valorant API",
  "delete_account": "Удалить аккаунт",
  "discord_server": "Discord-сервер",
  "donate": "Поддержать VShop",
  "donate_msg": "Поддержите разработку приложения и получите доступ к уведомлениям об обликах в списке желаемого, жертвуя любую сумму. Огромное спасибо <3",
  "donate_unlocked": "Вам доступны привилегии спонсора.",
  "fag": "Бесплатные агенты",
  "fetching": {
    "assets": "Получение материалов…",
    "donator": "Получение статуса пожертвования…"
  },
  "fetching.balances": "Получение балансов…",
  "fetching.entitlements_token": "Получение токена прав доступа…",
  "fetching.offers": "Получение предложений…",
  "fetching.progress": "Получение прогресса…",
  "fetching.storefront": "Получение витрины магазина…",
  "fetching.user_id": "Получение идентификатора пользователя…",
  "fetching.username": "Получение имени пользователя…",
  "gallery": "Галерея",
  "general": "Общее",
  "info": "Информация",
  "invalid_amount": "Неверное количество",
  "kc": "KC",
  "language": "Язык",
  "languages": {
    "es": "Испанский",
    "no": "Норвежский",
    "uk": "Украинский"
  },
  "languages.ar": "Арабский",
  "languages.de": "Немецкий",
  "languages.en": "Английский",
  "languages.fr": "Французский",
  "languages.it": "Итальянский",
  "languages.jp": "Японский",
  "languages.ko": "Корейский",
  "languages.pl": "Польский",
  "languages.pt": "Португальский",
  "languages.ru": "Русский",
  "languages.th": "Тайский",
  "languages.tr": "Турецкий",
  "languages.vi": "Вьетнамский",
  "languages.zh-Hans": "Упрощённый китайский",
  "languages.zh-Hant": "Традиционный китайский",
  "level": "Уровень",
  "levels": "Уровни",
  "links": "Ссылки",
  "login": "Войти",
  "logout": "Выйти",
  "minimum_amount": "Минимальное количество: {{amount}}",
  "never_show_again": "Не показывать снова",
  "next": "Далее",
  "nightmarket": "Ночной рынок",
  "no": "Нет, спасибо",
  "no_nightmarket": "Ночной рынок скоро вернётся.",
  "okay": "Хорошо",
  "privacy_policy": "Политика конфиденциальности",
  "profile": "Профиль",
  "progress": "Прогресс",
  "promotional": "Смотрите свой магазин Valorant где и когда угодно.",
  "purchase": {
    "error": "Произошла ошибка",
    "success": "Ваш заказ проходит проверку. Чтобы увидеть ваши привилегии, перезапустите приложение."
  },
  "rad": "Радианит",
  "region": "Регион",
  "region_info": "Пожалуйста, убедитесь в том, что вы выбрали соответствующий регион, иначе магазин будет не точным.",
  "regions.ap": "Азия",
  "regions.eu": "Европа",
  "regions.kr": "Корея",
  "regions.na": "Северная Америка",
  "screenshot_mode": "Режим для скриншотов",
  "separate": "отдельно",
  "settings": "Настройки",
  "shop": "Магазин",
  "signin": "Войти с помощью Riot ID",
  "signin_info": "Ваши данные входа будут отправлены напрямую в Riot Games.",
  "translators": "Переводчики",
  "update": {
    "available": {
      "description": "Новая версия VShop доступна для установки",
      "title": "Доступно обновление"
    },
    "download_github": "Скачать на GitHub"
  },
  "videos": "Видео",
  "vp": "VP",
  "welcome": "Добро пожаловать в VShop",
  "welcome_back": "С возвращением",
  "welcome_back_info": "Подождите, пока мы подключаем вас.",
  "wishlist": {
    "add": "Добавить в список желаемого",
    "name": "Список желаемого",
    "notification": {
      "disabled": "Уведомления отключены",
      "enabled": "Уведомления включены",
      "error": "Произошла ошибка при попытке проверить ваш магазин",
      "hit": "{{displayname}} находится в вашем магазине!",
      "info": "Получите уведомление, когда предмет из вашего списка желаемого появится в магазине.",
      "name": "Уведомления списка желаемого",
      "no_hit": "Сегодня не повезло: в магазине нет обликов из вашего списка желаемого.",
      "no_permission": "У нас нет разрешения отправлять вам уведомления!"
    },
    "remove": "Удалить из списка желаемого"
  },
  "xp": "Ед. опыта"
}



================================================
FILE: assets/i18n/ta.json
================================================
[Binary file]


================================================
FILE: assets/i18n/th.json
================================================
{
  "account": "เเอ๊คเค้าต์",
  "balances": "ยอดที่เหลือ",
  "bundles": "เเพ็ค",
  "credits": "เครดิต",
  "credits_techchrism": "เอกสารประกอบ Valorant API",
  "credits_valorantapi": "Valorant API อย่างไม่เป็นทางการ",
  "delete_account": "ลบเเอ๊คเค้าต์ทิ้ง",
  "discord_server": "เชิฟเวอร์ Discord",
  "donate": "บริจาค",
  "fag": "เอเจ็นฟรี",
  "fetching.balances": "โหลดยอดที่เหลือ…",
  "fetching.entitlements_token": "โหลด ยอดโทเค็นที่เหลือ…",
  "fetching.offers": "โหลด ของ…",
  "fetching.progress": "โหลด ความคืบหน้า…",
  "fetching.storefront": "โหลด หน้าร้าน…",
  "fetching.user_id": "โหลดไอดีของผู้เล่น…",
  "fetching.username": "โหลดชื่อของผู้เล่น…",
  "info": "ข้อมูล",
  "language": "ภาษา",
  "languages.ar": "อาราบิค",
  "languages.de": "เยอรมัน",
  "languages.en": "อังกฤษ",
  "languages.fr": "เฟร้น",
  "languages.it": "อิตาเลี่ยน",
  "languages.jp": "ญี่ปุ่น",
  "languages.ko": "เกาหลี",
  "languages.pl": "โปเลน",
  "languages.pt": "โปรตุเกส",
  "languages.ru": "รัสเซีย",
  "languages.th": "ไทย",
  "languages.tr": "ตุรกี",
  "languages.vi": "เวียดนาม",
  "languages.zh-Hans": "จีนเเบบย่อ",
  "languages.zh-Hant": "จีนดั้งเดิม",
  "links": "ลิ้งค์",
  "login": "เข้าสู่ระบบ",
  "logout": "ออกจากระบบ",
  "nightmarket": "ตลาดมืด",
  "no_nightmarket": "ตลาดมืด จะกลับมาในอีกไม่นาน",
  "privacy_policy": "นโยบายความเป็นส่วนตัว",
  "progress": "ความคืบหน้า",
  "promotional": "เห็น valorant shop ได้ทุกที่ทุกเวลา",
  "rad": "Radianite Points",
  "region": "ภาค",
  "regions.ap": "ในภูมิภาคเอเชียแปซิฟิก",
  "regions.eu": "ยุโรป",
  "regions.kr": "เกาหลี",
  "regions.na": "อเมริกาเหนือ",
  "separate": "เเยก",
  "settings": "การตั้งค่า",
  "shop": "ร้านค้า",
  "signin": "Sign in ด้วยไอดี RIOT ของคุณ",
  "translators": "นักแปล",
  "videos": "วิดีโอ",
  "vp": "Valorant point",
  "welcome": "ยินดีต้อนรับสู่ VShop",
  "xp": "XP"
}



================================================
FILE: assets/i18n/tr.json
================================================
{
  "accessories": "Aksesuar Mağazası",
  "account": "Hesap",
  "amount": "Miktar",
  "back": "Önceki",
  "balances": "Miktarlar",
  "battery_optimization_warning": {
    "action": "Pil optimizasyonunu devre dışı bırak",
    "description": "VShop için pil optimizasyonu etkinleştirildi. Bu, istek listesi bildirimlerinin düzgün çalışmasını engelleyebilir."
  },
  "bundles": "Paketler",
  "chromas": "Renkler",
  "copy_riot_id": "Riot hesap kimliğini kopyala",
  "credits": "Emeği geçenler",
  "credits_techchrism": "Valorant API belgeleri",
  "credits_valorantapi": "resmi olmayan VALORANT API'si",
  "delete_account": "Hesabı sil",
  "discord_server": "Discord sunucusu",
  "donate": "Bağış",
  "donate_msg": "Herhangi bir miktarda bağış yaparak istek listesi bildirimi özelliğine sahip olabilirsiniz. Çok teşekkür ederiz <3",
  "donate_unlocked": "Bağışcı özellikleri aktif edildi.",
  "fag": "Bedava Ajanlar",
  "fetching": {
    "assets": "Varlıklar alınıyor…",
    "donator": "Bağış durumunuz kontrol ediliyor…"
  },
  "fetching.balances": "Bakiyeler alınıyor…",
  "fetching.entitlements_token": "Yetkiler alınıyor…",
  "fetching.offers": "Teklifler alınıyor…",
  "fetching.progress": "İlerleme alınıyor…",
  "fetching.storefront": "Vitrin alınıyor…",
  "fetching.user_id": "Kullanıcı numarası alınıyor…",
  "fetching.username": "Kullanıcı adı alınıyor…",
  "gallery": "Galeri",
  "general": "Genel",
  "info": "Bilgi",
  "invalid_amount": "Geçersizmiktar {{amount}}.",
  "kc": "Kingdom Kredisi",
  "language": "Dil",
  "languages": {
    "es": "İspanyolca",
    "no": "Norveççe",
    "uk": "Ukraynaca"
  },
  "languages.ar": "Arapça",
  "languages.de": "Almanca",
  "languages.en": "İngilizce",
  "languages.fr": "Fransızca",
  "languages.it": "İtalyanca",
  "languages.jp": "Japonca",
  "languages.ko": "Korece",
  "languages.pl": "Lehçe",
  "languages.pt": "Portekizce",
  "languages.ru": "Rusça",
  "languages.th": "Tayca",
  "languages.tr": "Türkçe",
  "languages.vi": "Vietnamca",
  "languages.zh-Hans": "Çince (Basitleştirilmiş)",
  "languages.zh-Hant": "Çince (Geleneksel)",
  "level": "Seviye",
  "levels": "Seviyeler",
  "links": "Bağlantılar",
  "login": "Giriş yap",
  "logout": "Çıkış yap",
  "minimum_amount": "{{amount}}Minimum tutar",
  "never_show_again": "Tekrar gösterme",
  "next": "Sonraki",
  "nightmarket": "Gece Pazarı",
  "no": "Hayır, teşekkürler",
  "no_nightmarket": "Gece pazarı yakın zamanda tekrar gelecek.",
  "okay": "Tamam",
  "privacy_policy": "Gizlilik politikası",
  "profile": "Profil",
  "progress": "İlerleme",
  "promotional": "Valorant marketinizi istediğiniz zaman, istediğiniz yerden görüntüleyin.",
  "purchase": {
    "error": "Bir hata oluştu",
    "success": "Satın alma işleminiz işleniyor. Ayrıcalıklarınızdan faydalanmak için uygulamayı yeniden başlatmanız gerekiyor."
  },
  "rad": "Radyanit Puanları",
  "region": "Bölge",
  "region_info": "Lütfen doğru bölgeyi seçtiğinizden emin olun, aksi takdirde mağazanız yanlış görünebilir.",
  "regions.ap": "Pasifik Asya",
  "regions.eu": "Avrupa",
  "regions.kr": "Kore",
  "regions.na": "Kuzey Amerika",
  "screenshot_mode": "Ekran görüntüsü modu",
  "separate": "ayrı olarak",
  "settings": "Ayarlar",
  "shop": "Mağaza",
  "signin": "Riot ID ile giriş yap",
  "signin_info": "Giriş bilgileriniz doğrudan Riot Games'e gönderilecektir.",
  "translators": "Çevirmenler",
  "update": {
    "available": {
      "description": "VShop'un indirilebilir daha yeni bir sürümü mevcut",
      "title": "Güncelleme mevcut"
    },
    "download_github": "GitHub'dan indir"
  },
  "videos": "Videolar",
  "vp": "Valorant Puanları",
  "welcome": "VShop'a hoşgeldiniz",
  "welcome_back": "Tekrar hoş geldiniz",
  "welcome_back_info": "Oturumunuzu açarken lütfen bekleyiniz.",
  "wishlist": {
    "add": "İstek listene ekle",
    "name": "İstek listesi",
    "notification": {
      "disabled": "Bildirimler devre dışı bırakıldı",
      "enabled": "Bildirimler aktif edildi",
      "error": "Mağazanızı kontrol ederken bir hata oluştu",
      "hit": "{{displayname}} adlı skin şuan mağazanda!",
      "info": "İstek listenizdeki bir ürün, mağazanıza geldiğinde bir bildirim alın.",
      "name": "İstek listesi bildirimi",
      "no_hit": "Bugün şanslı değilsin: İstek listendeki hiç bir skin mağazanda değil.",
      "no_permission": "Size bildirim göndermek için gereken iznimiz yok!"
    },
    "remove": "İstek listenden kaldır"
  },
  "xp": "XP"
}



================================================
FILE: assets/i18n/uk.json
================================================
[Binary file]


================================================
FILE: assets/i18n/vi.json
================================================
{
  "accessories": "Cửa hàng phụ kiện",
  "account": "Tài khoản",
  "amount": "Số lượng",
  "back": "Quay lại",
  "balances": "Số dư",
  "battery_optimization_warning": {
    "action": "Tắt tối ưu hóa pin",
    "description": "Tối ưu hóa pin đang được bật cho VShop. Điều này có thể khiến thông báo danh sách yêu thích không hoạt động đúng cách."
  },
  "bundles": "Bộ",
  "chromas": "Màu",
  "copy_riot_id": "Sao chép ID Tài khoản Riot",
  "credits": "Danh đề",
  "credits_techchrism": "Thư mục API của Valorant",
  "credits_valorantapi": "API không chính thức của Valorant",
  "delete_account": "Xóa tài khoản",
  "discord_server": "Kênh Discord",
  "donate": "Quyên góp",
  "donate_msg": "Bằng cách ủng hộ để giúp phát triển app, bạn sẽ được sử dụng tính năng Thông báo wishlist. Cảm on rất nhiều <3",
  "donate_unlocked": "Bạn đã mở khóa các đặc quyền.",
  "fag": "Nhân vật miễn phí",
  "fetching": {
    "assets": "Đang tải tài nguyên…",
    "donator": "Tìm nạp trạng thái donator…"
  },
  "fetching.balances": "Tìm nạp số dư…",
  "fetching.entitlements_token": "Tìm nạp mã thông báo quyền lợi…",
  "fetching.offers": "Tìm nạp ưu đãi…",
  "fetching.progress": "Tìm nạp quá trình…",
  "fetching.storefront": "Tìm nạp mặt tiền cửa hàng…",
  "fetching.user_id": "Tìm nạp thông tin cá nhân…",
  "fetching.username": "Tìm nạp tài khoản…",
  "gallery": "Thư viện",
  "general": "Chung",
  "info": "Thông tin",
  "invalid_amount": "Số lượng tối thiểu là {{amount}}.",
  "kc": "kc",
  "language": "Ngôn ngữ",
  "languages": {
    "es": "Tiếng Tây Ban Nha",
    "no": "Tiếng Na Uy",
    "uk": "Tiếng Ukraina"
  },
  "languages.ar": "Tiếng Ả Rập",
  "languages.de": "Tiếng Đức",
  "languages.en": "Tiếng Anh",
  "languages.fr": "Tiếng Pháp",
  "languages.it": "Tiếng Ý",
  "languages.jp": "Tiếng Nhật",
  "languages.ko": "Tiếng Hàn Quốc",
  "languages.pl": "Tiếng Ba Lan",
  "languages.pt": "Tiếng Bồ Đào Nha",
  "languages.ru": "Tiếng Nga",
  "languages.th": "Tiếng Thái",
  "languages.tr": "Tiếng Thổ Nhĩ Kỳ",
  "languages.vi": "Tiếng Việt",
  "languages.zh-Hans": "Tiếng Trung Giản Thể",
  "languages.zh-Hant": "Tiếng Trung Phồn Thể",
  "level": "Cấp",
  "levels": "Cấp",
  "links": "Liên kết",
  "login": "Đăng nhập",
  "logout": "Đăng xuất",
  "never_show_again": "Không hiển thị nữa",
  "next": "Tiếp theo",
  "nightmarket": "Chợ Đêm",
  "no": "Không, cảm ơn",
  "no_nightmarket": "Chợ Đêm sẽ trở lại sớm.",
  "okay": "OK",
  "privacy_policy": "Chính sách bảo mật",
  "profile": "Hồ sơ",
  "progress": "Quá trình",
  "promotional": "Xem cửa hàng Valorant của bạn mọi lúc, mọi nơi.",
  "purchase": {
    "error": "Đã có sự cố",
    "success": "Đang xử lý đơn hàng của bạn. Bạn cần khởi động lại app để sử dụng đặc quyền."
  },
  "rad": "Điểm Radianite",
  "region": "Vùng",
  "region_info": "Vui lòng đảm bảo rằng bạn đã chọn đúng vùng, nếu không cửa hàng của bạn sẽ không chính xác.",
  "regions.ap": "Châu Á",
  "regions.eu": "Châu Âu",
  "regions.kr": "Hàn Quốc",
  "regions.na": "Bắc Mỹ",
  "screenshot_mode": "Chế độ chụp ảnh màn hình",
  "separate": "tách rời",
  "settings": "Cài đặt",
  "shop": "Cửa hàng",
  "signin": "Đăng nhập bằng Riot ID",
  "signin_info": "Thông tin đăng nhập của bạn sẽ được gửi trực tiếp đến Riot Games.",
  "translators": "Người dịch",
  "update": {
    "available": {
      "description": "Bạn có thể tải một phiên bản mới hơn của VShop",
      "title": "Có bản cập nhật mới"
    },
    "download_github": "Tải trên GitHub"
  },
  "videos": "Video",
  "vp": "Điểm Valorant",
  "welcome": "Chào mừng tới VShop",
  "welcome_back": "Chào mừng trở lại",
  "welcome_back_info": "Chúng tôi đang đăng nhập lại cho bạn.",
  "wishlist": {
    "add": "Thêm vào wishlist",
    "name": "Danh sách skin mong muốn (Wishlist)",
    "notification": {
      "disabled": "Thông báo đã được tắt",
      "enabled": "Thông báo đã được bật",
      "error": "Một sự cố đã xảy ra khi kiểm tra shop của bạn",
      "hit": "{{displayname}} đang ở trong shop của bạn!",
      "info": "Nhận thông báo khi skin trong wishlist trong shop của bạn.",
      "name": "Thông báo wishlist",
      "no_hit": "Hôm nay bạn không may rồi: Không có skin trong wishlist trong shop của bạn.",
      "no_permission": "Chúng tôi chưa có quyền gửi thông báo cho bạn!"
    },
    "remove": "Xóa khỏi wishlist"
  },
  "xp": "Kinh nghiệm"
}



================================================
FILE: assets/i18n/zh-Hans.json
================================================
{
  "account": "账户",
  "back": "返回",
  "balances": "余额",
  "bundles": "套装",
  "credits": "制作组",
  "credits_techchrism": "Valorant API 文档",
  "credits_valorantapi": "非官方Valorant API",
  "delete_account": "删除帐户",
  "discord_server": "Discord 服务器",
  "donate": "捐助",
  "fag": "免费契约者",
  "fetching.balances": "正在获取余额…",
  "fetching.entitlements_token": "正在获取权限令牌…",
  "fetching.offers": "获取优惠…",
  "fetching.progress": "获取进度…",
  "fetching.storefront": "获取商店前台…",
  "fetching.user_id": "获取ID用户名…",
  "fetching.username": "获取ID用户名…",
  "general": "通用",
  "info": "关于",
  "language": "语言",
  "languages.ar": "阿拉伯语",
  "languages.de": "德语",
  "languages.en": "英语",
  "languages.fr": "法语",
  "languages.it": "意大利语",
  "languages.jp": "日语",
  "languages.ko": "韩语",
  "languages.pl": "波兰语",
  "languages.pt": "葡萄牙语",
  "languages.ru": "俄语",
  "languages.th": "泰国语",
  "languages.tr": "土耳其语",
  "languages.vi": "越南语",
  "languages.zh-Hans": "简体中文",
  "languages.zh-Hant": "繁体中文",
  "level": "级别",
  "levels": "级别",
  "links": "链接",
  "login": "登录",
  "logout": "退出",
  "next": "下一个",
  "nightmarket": "夜市",
  "no": "不要",
  "no_nightmarket": "夜市会很快回来。",
  "okay": "好的",
  "privacy_policy": "隐私政策",
  "profile": "个人信息",
  "progress": "等级",
  "promotional": "在任何时间任何地点查看你的瓦罗兰特商店.",
  "rad": "辐能点数",
  "region": "地区",
  "region_info": "请确保你选择正确的地区，否则您可能进入错误的商店。",
  "regions.ap": "亚太",
  "regions.eu": "欧洲",
  "regions.kr": "韩国",
  "regions.na": "北美洲",
  "separate": "单价",
  "settings": "设置",
  "shop": "商店",
  "signin": "使用Riot帐号登录",
  "signin_info": "您的登录详细信息将直接发送至 Riot Games。",
  "translators": "翻译者",
  "videos": "视频",
  "vp": "特务币",
  "welcome": "欢迎来到VShop",
  "welcome_back": "欢迎回来",
  "welcome_back_info": "请稍等，我们会让您重新登录。",
  "xp": "XP"
}



================================================
FILE: assets/i18n/zh-Hant.json
================================================
{
  "account": "賬戶",
  "back": "返回",
  "balances": "餘額",
  "bundles": "套裝",
  "credits": "製作組",
  "credits_techchrism": "Valorant API 文檔",
  "credits_valorantapi": "非官方Valorant API",
  "delete_account": "刪除帳戶",
  "discord_server": "Discord 服務器",
  "donate": "捐助",
  "fag": "免費契約者",
  "fetching.balances": "正在獲取餘額…",
  "fetching.entitlements_token": "正在獲取權限令牌…",
  "fetching.offers": "獲取優惠…",
  "fetching.progress": "獲取進度…",
  "fetching.storefront": "獲取商店前台…",
  "fetching.user_id": "獲取ID用戶名…",
  "fetching.username": "獲取用戶名…",
  "general": "通用",
  "info": "關於",
  "language": "語言",
  "languages.ar": "阿拉伯語",
  "languages.de": "德語",
  "languages.en": "英語",
  "languages.fr": "法語",
  "languages.it": "意大利語",
  "languages.jp": "日語",
  "languages.ko": "韓語",
  "languages.pl": "波蘭語",
  "languages.pt": "葡萄牙語",
  "languages.ru": "俄語",
  "languages.th": "泰國語",
  "languages.tr": "土耳其語",
  "languages.vi": "越南語",
  "languages.zh-Hans": "簡體中文",
  "languages.zh-Hant": "繁體中文",
  "links": "鏈接",
  "login": "登錄",
  "logout": "退出",
  "next": "下一個",
  "nightmarket": "夜市",
  "no_nightmarket": "夜市會很快回來.",
  "okay": "好的",
  "privacy_policy": "隱私政策",
  "profile": "個人信息",
  "progress": "等級",
  "promotional": "在任何時間任何地點查看你的瓦羅蘭特商店.",
  "rad": "輻能點數",
  "region": "地區",
  "region_info": "請確保你選擇正確的地區，否則您可能進入錯誤的商店。",
  "regions.ap": "亞太",
  "regions.eu": "歐洲",
  "regions.kr": "韓國",
  "regions.na": "北美洲",
  "separate": "單價",
  "settings": "設置",
  "shop": "商店",
  "signin": "使用Riot帳號登錄",
  "signin_info": "您的登錄詳細信息將直接發送至 Riot Games。",
  "translators": "翻譯者",
  "videos": "視頻",
  "vp": "特務幣",
  "welcome": "歡迎來到VShop",
  "welcome_back": "歡迎回來",
  "welcome_back_info": "請稍等，我們會讓您重新登錄。",
  "xp": "XP"
}



================================================
FILE: components/BatteryOptimizationWarning.tsx
================================================
import { Banner } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isBatteryOptimizationEnabledAsync } from "expo-battery";
import { startActivityAsync, ActivityAction } from "expo-intent-launcher";
import { useWishlistStore } from "~/hooks/useWishlistStore";
import { AppState, Platform } from "react-native";
import * as Application from "expo-application";

export default function BatteryOptimizationWarning() {
  const [batteryOptimizationEnabled, setBatteryOptimizationEnabled] =
    useState(false);
  const { t } = useTranslation();
  const notificationEnabled = useWishlistStore(
    (state) => state.notificationEnabled
  );

  useEffect(() => {
    if (Platform.OS !== "android") return;

    checkBatteryOptimizations();

    const sub = AppState.addEventListener("focus", () => {
      checkBatteryOptimizations();
    });

    return () => {
      sub.remove();
    };
  }, []);

  const checkBatteryOptimizations = async () => {
    const enabled = await isBatteryOptimizationEnabledAsync();
    setBatteryOptimizationEnabled(enabled);
  };

  const requestIgnoreBatteryOptimizations = async () => {
    await startActivityAsync(
      ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
      { data: `package:${Application.applicationId}` }
    );
    await checkBatteryOptimizations();
  };

  return (
    <Banner
      visible={notificationEnabled && batteryOptimizationEnabled}
      style={{ backgroundColor: "#ffa70025" }}
      actions={[
        {
          label: t("battery_optimization_warning.action"),
          onPress: () => requestIgnoreBatteryOptimizations(),
        },
      ]}
      icon={({ color, size }) => (
        <Icon name="battery-alert" color={color} size={size} />
      )}
    >
      {t("battery_optimization_warning.description")}
    </Banner>
  );
}



================================================
FILE: components/BundleImage.tsx
================================================
import { ImageBackground, View } from "react-native";
import { Text } from "react-native-paper";
import CurrencyIcon from "./CurrencyIcon";
import Countdown from "./Countdown";
import { useFeatureStore } from "~/hooks/useFeatureStore";

interface props {
  bundle: BundleShopItem;
  remainingSecs: number;
}
export default function Bundle({ bundle, remainingSecs }: props) {
  const timestamp = new Date().getTime() + remainingSecs * 1000;
  const { screenshotModeEnabled } = useFeatureStore();

  return (
    <ImageBackground
      style={{
        marginBottom: 5,
        flex: 1,
        justifyContent: "center",
      }}
      source={{ uri: bundle.displayIcon }}
      resizeMode="cover"
    >
      <View
        style={{
          backgroundColor: !screenshotModeEnabled ? "#000000a0" : "#000000",
          padding: 50,
        }}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: 30,
          }}
        >
          {bundle.displayName}
        </Text>
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontSize: 15,
          }}
        >
          {bundle.price} <CurrencyIcon icon="vp" />
        </Text>
        <View
          style={{ position: "absolute", bottom: 5, right: 5, padding: 10 }}
        >
          <Countdown timestamp={timestamp} />
        </View>
      </View>
    </ImageBackground>
  );
}



================================================
FILE: components/BundleItem.tsx
================================================
import { useTranslation } from "react-i18next";
import { Card, Title, Button, Text, useTheme } from "react-native-paper";
import CurrencyIcon from "./CurrencyIcon";
import { useMediaPopupStore } from "./popups/MediaPopup";
import { useFeatureStore } from "~/hooks/useFeatureStore";
import { getDisplayIcon } from "~/utils/misc";

interface props {
  item: SkinShopItem;
}
export default function BundleItem(props: React.PropsWithChildren<props>) {
  const { t } = useTranslation();
  const { showMediaPopup } = useMediaPopupStore();
  const { screenshotModeEnabled } = useFeatureStore();
  const { colors } = useTheme();

  return (
    <>
      <Card style={{ margin: 5, backgroundColor: colors.surface }}>
        <Card.Content>
          <Title>{props.item.displayName}</Title>
          <Text>
            {props.item.price} <CurrencyIcon icon="vp" />{" "}
            <Text style={{ fontSize: 11 }}>({t("separate")})</Text>
          </Text>
        </Card.Content>
        <Card.Cover
          resizeMode="contain"
          style={{
            backgroundColor: colors.surface,
            padding: 10,
          }}
          source={getDisplayIcon(props.item, screenshotModeEnabled)}
        />
        <Card.Actions>
          <Button
            onPress={() =>
              showMediaPopup(
                props.item.levels.map(
                  (level) => level.streamedVideo || level.displayIcon || ""
                ),
                t("levels")
              )
            }
          >
            {t("levels")}
          </Button>
          <Button
            onPress={() =>
              showMediaPopup(
                props.item.chromas.map(
                  (chroma) => chroma.streamedVideo || chroma.fullRender
                ),
                t("chromas")
              )
            }
          >
            {t("chromas")}
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
}



================================================
FILE: components/Countdown.tsx
================================================
import { View } from "react-native";
import { Text } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";

interface props {
  timestamp: number;
}
export default function Countdown({ timestamp }: props) {
  const [diff, setDiff] = useState(timestamp - new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setDiff(timestamp - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  const days = Math.floor(diff / 1000 / 60 / 60 / 24);
  const hours = Math.floor(
    (diff - days * 1000 * 60 * 60 * 24) / 1000 / 60 / 60
  );
  const minutes = Math.floor(
    (diff - days * 1000 * 60 * 60 * 24 - hours * 1000 * 60 * 60) / 1000 / 60
  );
  const seconds = Math.floor(
    (diff -
      days * 1000 * 60 * 60 * 24 -
      hours * 1000 * 60 * 60 -
      minutes * 1000 * 60) /
      1000
  );

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Icon name="timer" size={15} color="white" style={{ marginRight: 3 }} />
      <Text
        style={{
          fontSize: 13,
        }}
      >
        {days > 0
          ? `${days}:${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
          : `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`}
      </Text>
    </View>
  );
}



================================================
FILE: components/CurrencyIcon.tsx
================================================
import { Image, View } from "react-native";

interface props {
  icon: "vp" | "rad" | "kc";
  paper?: boolean;
}

export default function CurrencyIcon(props: props) {
  return (
    <>
      {props.paper ? (
        <View
          style={{
            margin: 8,
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            style={{ width: 22, height: 22, marginRight: 15 }}
            source={
              props.icon === "vp"
                ? require("~/assets/images/vp.png")
                : (props.icon === "rad"
                    ? require("~/assets/images/radianite.png")
                    : require("~/assets/images/kc.png")
                  )
            }
            {...props}
          />
        </View>
      ) : (
        <Image
          style={{ width: 15, height: 15 }}
          source={
            props.icon === "vp"
                ? require("~/assets/images/vp.png")
                : (props.icon === "rad"
                        ? require("~/assets/images/radianite.png")
                        : require("~/assets/images/kc.png")
                )
          }
          {...props}
        />
      )}
    </>
  );
}



================================================
FILE: components/GalleryItem.tsx
================================================
import { useTranslation } from "react-i18next";
import { List, IconButton, Menu, Divider } from "react-native-paper";
import { Image } from "react-native";
import { useMediaPopupStore } from "./popups/MediaPopup";
import { useFeatureStore } from "~/hooks/useFeatureStore";
import { getDisplayIcon } from "~/utils/misc";
import { useState } from "react";

interface props {
  item: GalleryItem;
  toggleFromWishlist: Function;
}
export default function GalleryItem(props: React.PropsWithChildren<props>) {
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const { showMediaPopup } = useMediaPopupStore();
  const { screenshotModeEnabled } = useFeatureStore();

  return (
    <List.Item
      title={`${props.item.onWishlist ? "⭐ " : ""}${props.item.displayName}`}
      left={(_props) => (
        <Image
          {..._props}
          source={getDisplayIcon(props.item, screenshotModeEnabled)}
          style={{ width: 100, height: 50 }}
          resizeMode="contain"
        />
      )}
      right={(_props) => (
        <>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                props.toggleFromWishlist(props.item.levels[0].uuid);
              }}
              title={
                props.item.onWishlist ? t("wishlist.remove") : t("wishlist.add")
              }
              icon={props.item.onWishlist ? "minus" : "plus"}
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                showMediaPopup(
                  props.item.levels.map(
                    (level) => level.streamedVideo || level.displayIcon || ""
                  ),
                  t("levels")
                );
              }}
              title={t("levels")}
              icon="arrow-up-bold"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                showMediaPopup(
                  props.item.chromas.map(
                    (chroma) => chroma.streamedVideo || chroma.fullRender
                  ),
                  t("chromas")
                );
              }}
              title={t("chromas")}
              icon="format-color-fill"
            />
          </Menu>
        </>
      )}
    />
  );
}



================================================
FILE: components/Loading.tsx
================================================
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

interface props {
  msg?: string;
}
export default function Loading({ msg }: props) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator animating={true} color={"#fa4454"} size="large" />
      {msg && <Text style={{ marginTop: 10, color: "#fff" }}>{msg}</Text>}
    </View>
  );
}



================================================
FILE: components/LoginWebView.tsx
================================================
import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from "@react-native-cookies/cookies";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFeatureStore } from "~/hooks/useFeatureStore";
import { useUserStore } from "~/hooks/useUserStore";
import { getAccessTokenFromUri } from "~/utils/misc";
import {
  defaultUser,
  getBalances,
  getEntitlementsToken,
  getProgress,
  getShop,
  getUserId,
  getUsername,
  parseShop,
} from "~/utils/valorant-api";
import { checkDonator } from "~/utils/vshop-api";
import Loading from "./Loading";
import { View } from "react-native";
import WebView from "react-native-webview";
import { loadAssets } from "~/utils/valorant-assets";

const LOGIN_URL =
  "https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid";

export default function LoginWebView() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const { enableDonator, disableDonator } = useFeatureStore();
  const [loading, setLoading] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleWebViewChange = async (newNavState: {
    url?: string;
    title?: string;
    loading?: boolean;
    canGoBack?: boolean;
    canGoForward?: boolean;
  }) => {
    if (!newNavState.url) return;

    if (newNavState.url.includes("access_token=")) {
      const accessToken = getAccessTokenFromUri(newNavState.url);
      try {
        const region =
          (await AsyncStorage.getItem("region")) || defaultUser.region;

        setLoading(t("fetching.assets"));
        await loadAssets();

        setLoading(t("fetching.entitlements_token"));
        const entitlementsToken = await getEntitlementsToken(accessToken);

        setLoading(t("fetching.user_id"));
        const userId = getUserId(accessToken);

        setLoading(t("fetching.username"));
        const username = await getUsername(
          accessToken,
          entitlementsToken,
          userId,
          region
        );

        setLoading(t("fetching.storefront"));
        const shop = await getShop(
          accessToken,
          entitlementsToken,
          region,
          userId
        );
        const shops = await parseShop(shop);

        setLoading(t("fetching.progress"));
        const progress = await getProgress(
          accessToken,
          entitlementsToken,
          region,
          userId
        );

        setLoading(t("fetching.balances"));
        const balances = await getBalances(
          accessToken,
          entitlementsToken,
          region,
          userId
        );

        setLoading(t("fetching.donator"));
        const isDonator = await checkDonator(userId);
        if (isDonator) enableDonator();
        else disableDonator();

        setUser({
          id: userId,
          name: username,
          region,
          shops,
          progress,
          balances,
        });
        router.replace("/shop");
      } catch (e) {
        console.log(e);

        if (!__DEV__) {
          await CookieManager.clearAll(true);
          router.replace("/setup"); // Fallback to setup, so user doesn't get stuck
        }
      }
    }
  };

  if (loading) {
    return <Loading msg={loading} />;
  }

  return (
    <View
      style={{
        height: "80%",
      }}
      renderToHardwareTextureAndroid
    >
      <WebView
        userAgent="Mozilla/5.0 (Linux; Android) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36"
        source={{
          uri: LOGIN_URL,
        }}
        onNavigationStateChange={handleWebViewChange}
        injectedJavaScriptBeforeContentLoaded={`(function() {
              const deleteCookieBanner = () => {
                if (document.getElementsByClassName('osano-cm-window').length > 0) document.getElementsByClassName('osano-cm-window')[0].style = "display:none;";
                else setTimeout(deleteCookieBanner, 10)
              }
              deleteCookieBanner();
            })();`}
      />
    </View>
  );
}



================================================
FILE: components/NightMarketItem.tsx
================================================
import { useTranslation } from "react-i18next";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  useTheme,
} from "react-native-paper";
import CurrencyIcon from "./CurrencyIcon";
import { useMediaPopupStore } from "./popups/MediaPopup";
import { getDisplayIcon } from "~/utils/misc";
import { useFeatureStore } from "~/hooks/useFeatureStore";

interface props {
  item: NightMarketItem;
}
export default function NightMarketItem(props: React.PropsWithChildren<props>) {
  const { t } = useTranslation();
  const { showMediaPopup } = useMediaPopupStore();
  const { screenshotModeEnabled } = useFeatureStore();
  const { colors } = useTheme();

  return (
    <>
      <Card style={{ margin: 5, backgroundColor: colors.surface }}>
        <Card.Content>
          <Title>{props.item.displayName}</Title>
          <Paragraph>
            <Text
              style={{
                textDecorationLine: "line-through",
                textDecorationStyle: "solid",
                fontSize: 12,
              }}
            >
              {props.item.price}
            </Text>{" "}
            {props.item.discountedPrice} <CurrencyIcon icon="vp" /> (
            <Text
              style={{
                color: "green",
              }}
            >
              -{props.item.discountPercent}%
            </Text>
            )
          </Paragraph>
        </Card.Content>
        <Card.Cover
          resizeMode="contain"
          style={{
            backgroundColor: colors.surface,
            padding: 10,
          }}
          source={getDisplayIcon(props.item, screenshotModeEnabled)}
        />
        <Card.Actions>
          <Button
            onPress={() =>
              showMediaPopup(
                props.item.levels.map(
                  (level) => level.streamedVideo || level.displayIcon || ""
                ),
                t("levels")
              )
            }
          >
            {t("levels")}
          </Button>
          <Button
            onPress={() =>
              showMediaPopup(
                props.item.chromas.map(
                  (chroma) => chroma.streamedVideo || chroma.fullRender
                ),
                t("chromas")
              )
            }
          >
            {t("chromas")}
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
}



================================================
FILE: components/PlausibleProvider.tsx
================================================
import { PropsWithChildren, useEffect } from "react";
import { usePathname } from "expo-router";
import * as plausible from "~/utils/plausible";

export default function PlausibleProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();

  useEffect(() => {
    plausible.capture("pageview", pathname);
  }, [pathname]);

  return children;
}



================================================
FILE: components/ShopAccessoryItem.tsx
================================================
import { Card, Title, Paragraph, useTheme } from "react-native-paper";
import CurrencyIcon from "./CurrencyIcon";
import { useFeatureStore } from "~/hooks/useFeatureStore";
import { getDisplayIcon } from "~/utils/misc";

interface props {
  item: AccessoryShopItem;
}
export default function ShopAccessoryItem(
  props: React.PropsWithChildren<props>
) {
  const { screenshotModeEnabled } = useFeatureStore();
  const { colors } = useTheme();

  return (
    <>
      <Card
        style={{
          margin: 5,
          backgroundColor: colors.surface,
        }}
      >
        <Card.Content>
          <Title>{props.item.displayName}</Title>
          <Paragraph>
            {props.item.price} <CurrencyIcon icon="kc" />
          </Paragraph>
        </Card.Content>
        <Card.Cover
          resizeMode="contain"
          style={{
            backgroundColor: colors.surface,
            padding: 10,
          }}
          source={getDisplayIcon(props.item, screenshotModeEnabled)}
        />
      </Card>
    </>
  );
}



================================================
FILE: components/ShopItem.tsx
================================================
import { useTranslation } from "react-i18next";
import { Card, Title, Paragraph, Button, useTheme } from "react-native-paper";
import CurrencyIcon from "./CurrencyIcon";
import { useMediaPopupStore } from "./popups/MediaPopup";
import { useWishlistStore } from "~/hooks/useWishlistStore";
import { useFeatureStore } from "~/hooks/useFeatureStore";
import { getDisplayIcon } from "~/utils/misc";

interface props {
  item: SkinShopItem;
}
export default function ShopItem(props: React.PropsWithChildren<props>) {
  const { t } = useTranslation();
  const { showMediaPopup } = useMediaPopupStore();
  const { skinIds } = useWishlistStore();
  const { screenshotModeEnabled } = useFeatureStore();
  const { colors } = useTheme();

  return (
    <>
      <Card
        style={{
          margin: 5,
          backgroundColor: colors.surface,
        }}
      >
        <Card.Content>
          <Title>
            {skinIds.includes(props.item.levels[0].uuid)
              ? `⭐ ${props.item.displayName}`
              : props.item.displayName}
          </Title>
          <Paragraph>
            {props.item.price} <CurrencyIcon icon="vp" />
          </Paragraph>
        </Card.Content>
        <Card.Cover
          resizeMode="contain"
          style={{
            backgroundColor: colors.surface,
            padding: 10,
          }}
          source={getDisplayIcon(props.item, screenshotModeEnabled)}
        />
        <Card.Actions>
          <Button
            onPress={() =>
              showMediaPopup(
                props.item.levels.map(
                  (level) => level.streamedVideo || level.displayIcon || ""
                ),
                t("levels")
              )
            }
          >
            {t("levels")}
          </Button>
          <Button
            onPress={() =>
              showMediaPopup(
                props.item.chromas.map(
                  (chroma) => chroma.streamedVideo || chroma.fullRender
                ),
                t("chromas")
              )
            }
          >
            {t("chromas")}
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
}



================================================
FILE: components/popups/DonatePopup.tsx
================================================
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Modal,
  Paragraph,
  Portal,
  Text,
  TextInput,
  Title,
  useTheme,
} from "react-native-paper";
import { Linking, ToastAndroid, View } from "react-native";
import { create } from "zustand";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import {
  checkDonator,
  generatePaymentSheet,
  getCurrencies,
} from "~/utils/vshop-api";
import { PaymentSheet, useStripe } from "@stripe/stripe-react-native";
import { useUserStore } from "~/hooks/useUserStore";
import { useFeatureStore } from "~/hooks/useFeatureStore";
import { useEffect, useState } from "react";
import { getLocales } from "expo-localization";

interface IStore {
  visible: boolean;
  showDonatePopup: () => void;
  hideDonatePopup: () => void;
}
export const useDonatePopupStore = create<IStore>((set) => ({
  visible: false,
  showDonatePopup: () => set({ visible: true }),
  hideDonatePopup: () => set({ visible: false }),
}));

export default function DonatePopup() {
  const { t } = useTranslation();
  const { visible, hideDonatePopup } = useDonatePopupStore();
  const [currency, setCurrency] = useState<ICurrency>();
  const [amount, setAmount] = useState("");
  const parsedAmount = Number.parseFloat(amount.replace(",", "."));
  const isValidAmount = /^[0-9]+([,.][0-9]{1,2})?$/.test(amount);
  const { user } = useUserStore();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { enableDonator } = useFeatureStore();
  const { colors } = useTheme();

  const initializePaymentSheet = async () => {
    const res = await generatePaymentSheet({
      amount: parsedAmount,
      riotId: user.id,
      currencyCode: currency?.code.toLowerCase() ?? "",
    });
    if (res.status === 200) {
      const { paymentIntent } = res.data;

      const { error } = await initPaymentSheet({
        merchantDisplayName: "VShop",
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        billingDetailsCollectionConfiguration: {
          name: PaymentSheet.CollectionMode.ALWAYS,
          email: PaymentSheet.CollectionMode.ALWAYS,
        },
      });
      if (!error) return true;
      return false;
    } else {
      ToastAndroid.show(res.data.error, ToastAndroid.LONG);
    }
    return false;
  };

  const openPaymentSheet = async () => {
    const ready = await initializePaymentSheet();
    if (ready) {
      const { error } = await presentPaymentSheet();

      if (error) {
        ToastAndroid.show(t("purchase.error"), ToastAndroid.LONG);
        console.log(error);
      } else {
        ToastAndroid.show(t("purchase.success"), ToastAndroid.LONG);
        hideDonatePopup();
        setTimeout(async () => {
          const isDonator = await checkDonator(user.id);
          if (isDonator) enableDonator();
        }, 2500);
      }
    }
  };

  useEffect(() => {
    getCurrencies().then((currencies) => {
      const userCurrency = currencies.find(
        (_currency) =>
          _currency.code.toLowerCase() ===
          getLocales()[0].currencyCode?.toLocaleLowerCase()
      );
      if (userCurrency) setCurrency(userCurrency);
      else setCurrency(currencies[0]);
    });
  }, []);

  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideDonatePopup}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Card style={{ width: "80%" }}>
            <Card.Cover
              source={require("~/assets/images/notification.png")}
              resizeMode="center"
              resizeMethod="scale"
              style={{ height: 125, backgroundColor: colors.primary }}
            />
            <Card.Content style={{ marginTop: 5 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Icon
                  name="hand-coin"
                  size={25}
                  color="white"
                  style={{ marginRight: 5 }}
                />
                <Title style={{ color: "#fff" }}>{t("donate")}</Title>
              </View>
              <Paragraph>{t("donate_msg")}</Paragraph>
              <TextInput
                left={
                  <TextInput.Affix
                    text={currency?.symbol}
                    textStyle={{ paddingRight: 3 }}
                  />
                }
                label={t("amount")}
                keyboardType="numeric"
                mode="flat"
                value={amount}
                onChangeText={(value) => setAmount(value)}
                style={{ marginVertical: 5 }}
              />
              {amount.length > 0 &&
                (!isValidAmount ? (
                  <Text style={{ color: "red" }}>{t("invalid_amount")}</Text>
                ) : (
                  currency &&
                  parsedAmount < currency.minimum && (
                    <Text style={{ color: "red" }}>
                      {t("minimum_amount", {
                        amount: `${currency.symbol}${currency.minimum}`,
                      })}
                    </Text>
                  )
                ))}
            </Card.Content>
            <Card.Actions style={{ justifyContent: "flex-end" }}>
              <Button onPress={hideDonatePopup}>{t("no")}</Button>
              <Button
                onPress={openPaymentSheet}
                disabled={
                  !currency ||
                  !isValidAmount ||
                  amount.length === 0 ||
                  parsedAmount < currency.minimum
                }
              >
                {t("donate")}
              </Button>
            </Card.Actions>
          </Card>
        </View>
      </Modal>
    </Portal>
  );
}



================================================
FILE: components/popups/MediaPopup.tsx
================================================
import { Portal, Modal, Button, Text, useTheme } from "react-native-paper";
import { View } from "react-native";
import { ResizeMode, Video } from "expo-av";
import { create } from "zustand";
import { useState } from "react";
import { Image } from "expo-image";

interface IStore {
  uris: string[];
  text: string;
  selectedIndex: number;
  showMediaPopup: (uris: string[], text: string) => void;
  hideMediaPopup: () => void;
  setSelectedIndex: (index: number) => void;
}
export const useMediaPopupStore = create<IStore>((set) => ({
  uris: [],
  text: "",
  selectedIndex: 0,
  showMediaPopup: (uris: string[], text: string) =>
    set({ uris, text, selectedIndex: 0 }),
  hideMediaPopup: () => set({ uris: [], text: "" }),
  setSelectedIndex: (index: number) => set({ selectedIndex: index }),
}));

function MediaPopup() {
  const { uris, text, selectedIndex, setSelectedIndex, hideMediaPopup } =
    useMediaPopupStore();
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  return (
    <Portal>
      <Modal
        visible={uris.length > 0}
        onDismiss={() => {
          hideMediaPopup();
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <View style={{ padding: 10 }}>
            {uris.length > 0 &&
              (uris[selectedIndex].endsWith(".png") ||
              uris[selectedIndex].endsWith(".jpg") ? (
                <Image
                  style={{
                    aspectRatio: 16 / 9,
                    width: "100%",
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                    backgroundColor: "#000",
                  }}
                  contentFit="contain"
                  source={{ uri: uris[selectedIndex] }}
                  onLoadStart={() => setLoading(true)}
                  onLoad={() => setLoading(false)}
                />
              ) : (
                <Video
                  source={{ uri: uris[selectedIndex] }}
                  style={{
                    aspectRatio: 16 / 9,
                    width: "100%",
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                  }}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay
                  isMuted={false}
                  isLooping={true}
                  onLoadStart={() => setLoading(true)}
                  onLoad={() => setLoading(false)}
                />
              ))}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#000",
                borderBottomLeftRadius: 5,
                borderBottomRightRadius: 5,
              }}
            >
              <Text
                style={{
                  textTransform: "uppercase",
                  color: colors.primary,
                  fontSize: 15,
                  marginRight: 5,
                }}
              >
                {text}
              </Text>
              {uris.map((uri, i) => (
                <View
                  style={{
                    borderBottomWidth: i === selectedIndex ? 1 : 0,
                    borderBottomColor: colors.primary,
                  }}
                  key={i}
                >
                  <Button
                    onPress={() => setSelectedIndex(i)}
                    loading={i === selectedIndex && loading}
                  >
                    {i + 1}
                  </Button>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

export default MediaPopup;



================================================
FILE: components/popups/UpdatePopup.tsx
================================================
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
import {
  Button,
  Card,
  Modal,
  Paragraph,
  Portal,
  Title,
} from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import * as Application from "expo-application";

export default function UpdatePopup() {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const checkUpdate = async () => {
      const res = await axios.request({
        url: "https://api.github.com/repos/vshopapp/mobile/releases/latest",
        method: "GET",
      });
      if (compareVersions(res.data.tag_name) === -1) setVisible(true);
    };
    checkUpdate();
  }, []);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => {
          setVisible(false);
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Card style={{ width: "80%" }}>
            <Card.Content>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Icon
                  name="update"
                  size={25}
                  color="white"
                  style={{ marginRight: 5 }}
                />
                <Title style={{ color: "#fff" }}>
                  {t("update.available.title")}
                </Title>
              </View>
              <Paragraph>{t("update.available.description")}</Paragraph>
            </Card.Content>
            <Card.Actions style={{ justifyContent: "flex-end" }}>
              <Button onPress={() => setVisible(false)}>{t("no")}</Button>
              <Button
                onPress={() =>
                  Linking.openURL(
                    "https://github.com/VShopApp/mobile/releases/latest"
                  )
                }
              >
                {t("update.download_github")}
              </Button>
            </Card.Actions>
          </Card>
        </View>
      </Modal>
    </Portal>
  );
}

function compareVersions(githubTag: string) {
  if (!Application.nativeApplicationVersion) return 0;

  const versionParts = Application.nativeApplicationVersion.split(".");
  const githubTagParts = githubTag.replace("v", "").split(".");

  for (let i = 0; i < versionParts.length; i++) {
    const versionNumber = Number.parseInt(versionParts[i]);
    const githubTagNumber = Number.parseInt(githubTagParts[i]);

    if (versionNumber < githubTagNumber) {
      return -1;
    } else if (versionNumber > githubTagNumber) {
      return 1;
    }
  }

  return 0;
}



================================================
FILE: constants/Colors.ts
================================================
/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};



================================================
FILE: hooks/useFeatureStore.ts
================================================
import { create } from "zustand";

interface FeatureState {
  isDonator: boolean;
  enableDonator: () => void;
  disableDonator: () => void;
  screenshotModeEnabled: boolean;
  toggleScreenshotMode: () => void;
}

export const useFeatureStore = create<FeatureState>((set) => ({
  isDonator: false,
  enableDonator: () => set({ isDonator: true }),
  disableDonator: () => set({ isDonator: false }),
  screenshotModeEnabled: false,
  toggleScreenshotMode: () =>
    set((state) => ({ screenshotModeEnabled: !state.screenshotModeEnabled })),
}));



================================================
FILE: hooks/useUserStore.ts
================================================
import { create } from "zustand";
import { defaultUser } from "~/utils/valorant-api";

interface UserState {
  user: typeof defaultUser;
  setUser: (user: typeof defaultUser) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: defaultUser,
  setUser: (user) => set({ user }),
}));



================================================
FILE: hooks/useWishlistStore.ts
================================================
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistState {
  notificationEnabled: boolean;
  setNotificationEnabled: (value: boolean) => void;
  skinIds: string[];
  toggleSkin: (uuid: string) => void;
}
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      notificationEnabled: false,
      setNotificationEnabled: (value) => {
        set({ notificationEnabled: value });
      },
      skinIds: [],
      toggleSkin: (uuid: string) =>
        set({
          skinIds: get().skinIds.includes(uuid)
            ? get().skinIds.filter((el) => el !== uuid)
            : [...get().skinIds, uuid],
        }),
    }),
    {
      name: "wishlist",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);



================================================
FILE: types/App.d.ts
================================================
interface SkinShopItem extends ValorantSkin {
  price: number;
}

interface AccessoryShopItem {
  uuid: string;
  displayName: string;
  displayIcon?: string;
  price: number;
}

interface GalleryItem extends ValorantSkin {
  onWishlist: boolean;
}

interface NightMarketItem extends SkinShopItem {
  discountedPrice: number;
  discountPercent: number;
}

interface BundleShopItem extends ValorantBundle {
  price: number;
  items: SkinShopItem[];
}

interface Balance {
  vp: number;
  rad: number;
  fag: number;
}

interface Progress {
  level: number;
  xp: number;
}



================================================
FILE: types/https-browserify.d.ts
================================================
declare module "https-browserify";



================================================
FILE: types/valorant-api.d.ts
================================================
type StorefrontResponse = {
  FeaturedBundle: {
    Bundle: {
      /** UUID */
      ID: string;
      /** UUID */
      DataAssetID: string;
      /** Currency ID */
      CurrencyID: string;
      Items: {
        Item: {
          /** Item Type ID */
          ItemTypeID: string;
          /** Item ID */
          ItemID: string;
          Amount: number;
        };
        BasePrice: number;
        /** Currency ID */
        CurrencyID: string;
        DiscountPercent: number;
        DiscountedPrice: number;
        IsPromoItem: boolean;
      }[];
      ItemOffers:
        | {
            /** UUID */
            BundleItemOfferID: string;
            Offer: {
              OfferID: string;
              IsDirectPurchase: boolean;
              /** Date in ISO 8601 format */
              StartDate: string;
              Cost: {
                [x: string]: number;
              };
              Rewards: {
                /** Item Type ID */
                ItemTypeID: string;
                /** Item ID */
                ItemID: string;
                Quantity: number;
              }[];
            };
            DiscountPercent: number;
            DiscountedCost: {
              [x: string]: number;
            };
          }[]
        | null;
      TotalBaseCost: {
        [x: string]: number;
      } | null;
      TotalDiscountedCost: {
        [x: string]: number;
      } | null;
      TotalDiscountPercent: number;
      DurationRemainingInSeconds: number;
      WholesaleOnly: boolean;
    };
    Bundles: {
      /** UUID */
      ID: string;
      /** UUID */
      DataAssetID: string;
      /** Currency ID */
      CurrencyID: string;
      Items: {
        Item: {
          /** Item Type ID */
          ItemTypeID: string;
          /** Item ID */
          ItemID: string;
          Amount: number;
        };
        BasePrice: number;
        /** Currency ID */
        CurrencyID: string;
        DiscountPercent: number;
        DiscountedPrice: number;
        IsPromoItem: boolean;
      }[];
      ItemOffers:
        | {
            /** UUID */
            BundleItemOfferID: string;
            Offer: {
              OfferID: string;
              IsDirectPurchase: boolean;
              /** Date in ISO 8601 format */
              StartDate: string;
              Cost: {
                [x: string]: number;
              };
              Rewards: {
                /** Item Type ID */
                ItemTypeID: string;
                /** Item ID */
                ItemID: string;
                Quantity: number;
              }[];
            };
            DiscountPercent: number;
            DiscountedCost: {
              [x: string]: number;
            };
          }[]
        | null;
      TotalBaseCost: {
        [x: string]: number;
      } | null;
      TotalDiscountedCost: {
        [x: string]: number;
      } | null;
      TotalDiscountPercent: number;
      DurationRemainingInSeconds: number;
      WholesaleOnly: boolean;
    }[];
    BundleRemainingDurationInSeconds: number;
  };
  SkinsPanelLayout: {
    SingleItemOffers: string[];
    SingleItemStoreOffers: {
      OfferID: string;
      IsDirectPurchase: boolean;
      /** Date in ISO 8601 format */
      StartDate: string;
      Cost: {
        [x: string]: number;
      };
      Rewards: {
        /** Item Type ID */
        ItemTypeID: string;
        /** Item ID */
        ItemID: string;
        Quantity: number;
      }[];
    }[];
    SingleItemOffersRemainingDurationInSeconds: number;
  };
  UpgradeCurrencyStore: {
    UpgradeCurrencyOffers: {
      /** UUID */
      OfferID: string;
      /** Item ID */
      StorefrontItemID: string;
      Offer: {
        OfferID: string;
        IsDirectPurchase: boolean;
        /** Date in ISO 8601 format */
        StartDate: string;
        Cost: {
          [x: string]: number;
        };
        Rewards: {
          /** Item Type ID */
          ItemTypeID: string;
          /** Item ID */
          ItemID: string;
          Quantity: number;
        }[];
      };
      DiscountedPercent: number;
    }[];
  };
  AccessoryStore: {
    AccessoryStoreOffers: {
      Offer: {
        OfferID: string;
        IsDirectPurchase: boolean;
        /** Date in ISO 8601 format */
        StartDate: string;
        Cost: {
          [x: string]: number;
        };
        Rewards: {
          /** Item Type ID */
          ItemTypeID: string;
          /** Item ID */
          ItemID: string;
          Quantity: number;
        }[];
      };
      /** UUID */
      ContractID: string;
    }[];
    AccessoryStoreRemainingDurationInSeconds: number;
    /** UUID */
    StorefrontID: string;
  };
  /** Night market */
  BonusStore?:
    | {
        BonusStoreOffers: {
          /** UUID */
          BonusOfferID: string;
          Offer: {
            OfferID: string;
            IsDirectPurchase: boolean;
            /** Date in ISO 8601 format */
            StartDate: string;
            Cost: {
              [x: string]: number;
            };
            Rewards: {
              /** Item Type ID */
              ItemTypeID: string;
              /** Item ID */
              ItemID: string;
              Quantity: number;
            }[];
          };
          DiscountPercent: number;
          DiscountCosts: {
            [x: string]: number;
          };
          IsSeen: boolean;
        }[];
        BonusStoreRemainingDurationInSeconds: number;
      }
    | undefined;
};

type PricesResponse = {
  Offers: {
    OfferID: string;
    IsDirectPurchase: boolean;
    /** Date in ISO 8601 format */
    StartDate: string;
    Cost: {
      [x: string]: number;
    };
    Rewards: {
      /** Item Type ID */
      ItemTypeID: string;
      /** Item ID */
      ItemID: string;
      Quantity: number;
    }[];
  }[];
};

type WalletResponse = {
  Balances: {
    [x: string]: number;
  };
};

type EntitlementResponse = {
  entitlements_token: string;
};

type NameServiceResponse = {
  DisplayName: string;
  /** Player UUID */
  Subject: string;
  GameName: string;
  TagLine: string;
}[];

type AccountXPResponse = {
  Version: number;
  /** Player UUID */
  Subject: string;
  Progress: {
    Level: number;
    XP: number;
  };
  History: {
    /** Match ID */
    ID: string;
    /** Date in ISO 8601 format */
    MatchStart: string;
    StartProgress: {
      Level: number;
      XP: number;
    };
    EndProgress: {
      Level: number;
      XP: number;
    };
    XPDelta: number;
    XPSources: {
      ID: "time-played" | "match-win" | "first-win-of-the-day";
      Amount: number;
    }[];
    XPMultipliers: unknown[];
  }[];
  /** Date in ISO 8601 format */
  LastTimeGrantedFirstWin: string;
  /** Date in ISO 8601 format */
  NextTimeFirstWinAvailable: string;
};



================================================
FILE: types/valorant-assets.d.ts
================================================
interface ValorantSkin {
  uuid: string;
  displayName: string;
  themeUuid: string;
  contentTierUuid?: string;
  displayIcon?: string;
  wallpaper?: string;
  assetPath: string;
  chromas: ISkinChroma[];
  levels: ISkinLevel[];
}

interface ValorantBuddyAccessory {
  uuid: string;
  displayName: string;
  isHiddenIfNotOwned: boolean;
  themeUuid: string;
  displayIcon?: string;
  assetPath: string;
  levels: ValorantBuddyLevel[];
}

interface ValorantTitleAccessory {
  uuid: string;
  displayName: string;
  isHiddenIfNotOwned: boolean;
  titleText: string;
  assetPath: string;
}

interface ValorantCardAccessory {
  uuid: string;
  displayName: string;
  isHiddenIfNotOwned: boolean;
  themeUuid: string;
  displayIcon: string;
  smallArt: string;
  wideArt: string;
  largeArt: string;
  assetPath: string;
}

interface ValorantSprayAccessory {
  uuid: string;
  displayName: string;
  category: string;
  themeUuid: string;
  isNullSpray: boolean;
  hideIfNotOwned: boolean;
  displayIcon: string;
  fullIcon: string;
  fullTransparentIcon: string;
  animationPng: string;
  animationGif: string;
  assetPath: string;
  levels: ValorantSprayLevel[];
}

interface ValorantBuddyLevel {
  uuid: string;
  charmLevel: number;
  hideIfNotOwned: boolean;
  displayName: string;
  displayIcon: string;
  assetPath: string;
}

interface ValorantSprayLevel {
  uuid: string;
  sprayLevel: number;
  displayName: string;
  displayIcon: string;
  assetPath: string;
}

interface ValorantBundle {
  uuid: string;
  displayName: string;
  displayNameSubText?: string;
  description: string;
  extraDescription?: string;
  promoDescription?: string;
  useAdditionalContext: boolean;
  displayIcon: string;
  displayIcon2: string;
  verticalPromoImage?: string;
  assetPath: string;
}

interface ValorantSkinChroma {
  uuid: string;
  displayName: string;
  displayIcon?: string;
  fullRender: string;
  swatch?: string;
  streamedVideo?: string;
  assetPath: string;
}

interface ValorantSkinLevel {
  uuid: string;
  displayName: string;
  levelItem?: string;
  displayIcon?: string;
  streamedVideo?: string;
  assetPath: string;
}

interface ValorantBundle {
  uuid: string;
  displayName: string;
  displayNameSubText: any;
  description: string;
  extraDescription: any;
  promoDescription: any;
  useAdditionalContext: boolean;
  displayIcon: string;
  displayIcon2: string;
  logoIcon: any;
  verticalPromoImage: string;
  assetPath: string;
}



================================================
FILE: types/vshop-api.d.ts
================================================
interface ICurrency {
  code: string;
  symbol: string;
  minimum: number;
  zeroDecimal: boolean;
}



================================================
FILE: utils/localization.ts
================================================
import i18n, { ModuleType } from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";

import en from "~/assets/i18n/en.json";
import ar from "~/assets/i18n/ar.json";
import de from "~/assets/i18n/de.json";
import es from "~/assets/i18n/es.json";
import fr from "~/assets/i18n/fr.json";
import it from "~/assets/i18n/it.json";
import jp from "~/assets/i18n/jp.json";
import ko from "~/assets/i18n/ko.json";
import no from "~/assets/i18n/no.json";
import pl from "~/assets/i18n/pl.json";
import pt from "~/assets/i18n/pt.json";
import ru from "~/assets/i18n/ru.json";
import ta from "~/assets/i18n/ta.json";
import th from "~/assets/i18n/th.json";
import tr from "~/assets/i18n/tr.json";
import uk from "~/assets/i18n/uk.json";
import vi from "~/assets/i18n/vi.json";
import zhHans from "~/assets/i18n/zh-Hans.json";
import zhHant from "~/assets/i18n/zh-Hant.json";

// https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
export const resources = {
  ar: { translation: ar, VAPILangCode: "ar-AE" },
  de: { translation: de, VAPILangCode: "de-DE" },
  en: { translation: en, VAPILangCode: "en-US" },
  es: { translation: es, VAPILangCode: "es-ES" },
  fr: { translation: fr, VAPILangCode: "fr-FR" },
  it: { translation: it, VAPILangCode: "it-IT" },
  jp: { translation: jp, VAPILangCode: "ja-JP" },
  ko: { translation: ko, VAPILangCode: "ko-KR" },
  no: { translation: no, VAPILangCode: "en-US" },
  pl: { translation: pl, VAPILangCode: "pl-PL" },
  pt: { translation: pt, VAPILangCode: "pt-BR" },
  ru: { translation: ru, VAPILangCode: "ru-RU" },
  ta: { translation: ta, VAPILangCode: "en-US" },
  th: { translation: th, VAPILangCode: "th-TH" },
  tr: { translation: tr, VAPILangCode: "tr-TR" },
  uk: { translation: uk, VAPILangCode: "vi-VN" },
  vi: { translation: vi, VAPILangCode: "vi-VN" },
  "zh-Hans": { translation: zhHans, VAPILangCode: "zh-CN" },
  "zh-Hant": { translation: zhHant, VAPILangCode: "zh-TW" },
};

export const getVAPILang = () => {
  const translation = resources[i18n.language as keyof typeof resources];

  return translation ? translation.VAPILangCode : "en-US";
};

const langDetector = {
  type: "languageDetector" as ModuleType,
  async: true,
  detect: (callback: any) => {
    AsyncStorage.getItem("language", (error, result) => {
      if (error || !result) {
        const lang = getLocales()[0].languageCode || "en";
        callback(lang);
      } else {
        callback(result);
      }
    });
  },
  init: () => {},
  cacheUserLanguage: (language: string) => {
    AsyncStorage.setItem("language", language);
  },
};

i18n
  .use(langDetector)
  .use(initReactI18next)
  .init({
    resources,
    compatibilityJSON: "v3",
    fallbackLng: "en",
    debug: __DEV__,
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;



================================================
FILE: utils/misc.ts
================================================
export const VCurrencies = {
  VP: "85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741", // VP
  RAD: "e59aa87c-4cbf-517a-5983-6e81511be9b7", // Radianite Points
  FAG: "f08d4ae3-939c-4576-ab26-09ce1f23bb37", // Free Agents
  KC: "85ca954a-41f2-ce94-9b45-8ca3dd39a00d", // Kingdom Credits
};

export const VItemTypes = {
  SkinLevel: "e7c63390-eda7-46e0-bb7a-a6abdacd2433",
  SkinChroma: "3ad1b2b2-acdb-4524-852f-954a76ddae0a",
  Agent: "01bb38e1-da47-4e6a-9b3d-945fe4655707",
  ContractDefinition: "f85cb6f7-33e5-4dc8-b609-ec7212301948",
  Buddy: "dd3bf334-87f3-40bd-b043-682a57a8dc3a",
  Spray: "d5f120f8-ff8c-4aac-92ea-f2b5acbe9475",
  PlayerCard: "3f296c07-64c3-494c-923b-fe692a4fa1bd",
  PlayerTitle: "de7caa6b-adf7-4588-bbd1-143831e786c6",
};

export const regions = ["eu", "na", "ap", "kr"];

export const getAccessTokenFromUri = (uri: string) => {
  const match = uri.match(/access_token=([^\s&]+)/);
  if (!match) throw new Error("Could not extract access token from uri");

  return match[1];
};

export const getDisplayIcon = (
  item: SkinShopItem | NightMarketItem | GalleryItem | AccessoryShopItem,
  screenshotModeEnabled: boolean
) => {
  const imgUri =
    "levels" in item ? item.levels[0].displayIcon : item.displayIcon;
  if (imgUri && !screenshotModeEnabled) return { uri: imgUri };
  return require("~/assets/images/noimage.png");
};

export const isSameDayUTC = (d1: Date, d2: Date) => {
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
};



================================================
FILE: utils/plausible.ts
================================================
import axios from "axios";
import * as Device from "expo-device";
import * as Application from "expo-application";
import { Platform } from "react-native";

let userAgent: string;
let appVersion: string | undefined;

// https://plausible.io/docs/events-api
export async function capture(
  name: "pageview" | "wishlist_check",
  path?: string
) {
  if (
    !process.env.EXPO_PUBLIC_PLAUSIBLE_URL ||
    !process.env.EXPO_PUBLIC_PLAUSIBLE_DOMAIN
  )
    return;

  if (!userAgent) {
    const osName =
      Platform.OS === "android"
        ? "Android"
        : Platform.OS === "ios"
        ? "iOS"
        : null;
    const os = osName ? `${osName} ${Device.osVersion ?? ""}` : null;
    const modelName = Device.modelName;
    const platform = [os, modelName].filter((i) => !!i).join("; ");

    userAgent = `Mozilla/5.0 (${platform}) Gecko/20100101 Chrome/53.0`;
  }

  if (!appVersion) {
    appVersion = Application.nativeApplicationVersion || undefined;
  }

  await axios.request({
    url: `${process.env.EXPO_PUBLIC_PLAUSIBLE_URL}/api/event`,
    method: "POST",
    headers: {
      "User-Agent": userAgent,
      "Content-Type": "application/json",
    },
    data: {
      name,
      domain: process.env.EXPO_PUBLIC_PLAUSIBLE_DOMAIN,
      url: `app://localhost${path ?? ""}`,
      props: {
        app_version: appVersion,
      },
    },
  });
}



================================================
FILE: utils/valorant-api.ts
================================================
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { VCurrencies, VItemTypes } from "./misc";
import https from "https-browserify";
import { fetchBundle, getAssets } from "./valorant-assets";

axios.interceptors.request.use(
  function (config) {
    if (__DEV__) console.log(`${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export let defaultUser = {
  id: "",
  name: "",
  region: "",
  shops: {
    main: [] as SkinShopItem[],
    bundles: [] as BundleShopItem[],
    nightMarket: [] as NightMarketItem[],
    accessory: [] as AccessoryShopItem[],
    remainingSecs: {
      main: 0,
      bundles: [0],
      nightMarket: 0,
      accessory: 0,
    },
  },
  balances: {
    vp: 0,
    rad: 0,
    fag: 0,
    kc: 0,
  },
  progress: {
    level: 0,
    xp: 0,
  },
};

const extraHeaders = () => ({
  "X-Riot-ClientVersion":
    getAssets().riotClientVersion || "43.0.1.4195386.4190634",
  "X-Riot-ClientPlatform":
    "eyJwbGF0Zm9ybVR5cGUiOiJQQyIsInBsYXRmb3JtT1MiOiJXaW5kb3dzIiwicGxhdGZvcm1PU1ZlcnNpb24iOiIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwicGxhdGZvcm1DaGlwc2V0IjoiVW5rbm93biJ9",
});

export async function getEntitlementsToken(accessToken: string) {
  const res = await axios.request<EntitlementResponse>({
    url: getUrl("entitlements"),
    method: "POST",
    headers: {
      ...extraHeaders(),
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: {},
  });

  return res.data.entitlements_token;
}

export function getUserId(accessToken: string) {
  const data = jwtDecode(accessToken) as any;

  return data.sub;
}

export async function getUsername(
  accessToken: string,
  entitlementsToken: string,
  userId: string,
  region: string
) {
  const res = await axios.request<NameServiceResponse>({
    url: getUrl("name", region),
    method: "PUT",
    headers: {
      ...extraHeaders(),
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Riot-Entitlements-JWT": entitlementsToken,
    },
    data: [userId],
  });

  return res.data[0].GameName !== "" ? res.data[0].GameName : "?";
}

export async function getShop(
  accessToken: string,
  entitlementsToken: string,
  region: string,
  userId: string
) {
  const res = await axios.request<StorefrontResponse>({
    url: getUrl("storefront", region, userId),
    method: "POST",
    headers: {
      ...extraHeaders(),
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Riot-Entitlements-JWT": entitlementsToken,
    },
    data: {},
  });

  return res.data;
}

export async function parseShop(shop: StorefrontResponse) {
  /* NORMAL SHOP */
  let singleItemStoreOffers = shop.SkinsPanelLayout.SingleItemStoreOffers;
  let main: SkinShopItem[] = [];
  const { skins, buddies, cards, sprays, titles } = getAssets();

  for (var i = 0; i < singleItemStoreOffers.length; i++) {
    const offer = singleItemStoreOffers[i];

    const skin = skins.find((_skin) => _skin.levels[0].uuid === offer.OfferID);

    if (skin) {
      main[i] = {
        ...skin,
        price: offer.Cost[VCurrencies.VP],
      };
    }
  }

  /* BUNDLES */
  const bundles: BundleShopItem[] = [];
  for (var b = 0; b < shop.FeaturedBundle.Bundles.length; b++) {
    const bundle = shop.FeaturedBundle.Bundles[b];
    const bundleAsset = await fetchBundle(bundle.DataAssetID);

    if (bundleAsset != null) {
      bundles.push({
        ...bundleAsset,
        price: bundle.Items.map((item) => item.DiscountedPrice).reduce(
          (a, b) => a + b
        ),
        items: bundle.Items.filter(
          (item) => item.Item.ItemTypeID === VItemTypes.SkinLevel
        ).map((item) => {
          const skin = skins.find(
            (_skin) => _skin.levels[0].uuid === item.Item.ItemID
          ) as ValorantSkin;

          return {
            ...skin,
            price: item.BasePrice,
          };
        }),
      });
    }
  }

  /* NIGHT MARKET */
  let nightMarket: NightMarketItem[] = [];
  if (shop.BonusStore) {
    var bonusStore = shop.BonusStore.BonusStoreOffers;
    for (var k = 0; k < bonusStore.length; k++) {
      let itemid = bonusStore[k].Offer.Rewards[0].ItemID;
      const skin = skins.find(
        (_skin) => _skin.levels[0].uuid === itemid
      ) as ValorantSkin;

      nightMarket.push({
        ...skin,
        price: bonusStore[k].Offer.Cost[VCurrencies.VP],
        discountedPrice: bonusStore[k].DiscountCosts[VCurrencies.VP],
        discountPercent: bonusStore[k].DiscountPercent,
      });
    }
  }

  /* ACCESSORY SHOP */
  let accessoryStore = shop.AccessoryStore.AccessoryStoreOffers;
  let accessory: AccessoryShopItem[] = [];
  for (var i = 0; i < accessoryStore.length; i++) {
    const accessoryItem = accessoryStore[i].Offer;

    // This is a pain because of different return types
    const buddy = buddies.find(
      (_skin) => _skin.levels[0].uuid === accessoryItem.Rewards[0].ItemID
    );
    const card = cards.find(
      (_skin) => _skin.uuid === accessoryItem.Rewards[0].ItemID
    );
    const title = titles.find(
      (_skin) => _skin.uuid === accessoryItem.Rewards[0].ItemID
    );
    const spray = sprays.find(
      (_skin) => _skin.uuid === accessoryItem.Rewards[0].ItemID
    );

    if (buddy) {
      accessory[i] = {
        uuid: buddy.levels[0].uuid,
        displayName: buddy.displayName,
        displayIcon: buddy.levels[0].displayIcon,
        price: accessoryItem.Cost[VCurrencies.KC],
      };
    } else if (card) {
      accessory[i] = {
        uuid: card.uuid,
        displayName: card.displayName,
        displayIcon: card.largeArt,
        price: accessoryItem.Cost[VCurrencies.KC],
      };
    } else if (title) {
      accessory[i] = {
        uuid: title.uuid,
        displayName: title.displayName,
        price: accessoryItem.Cost[VCurrencies.KC],
      };
    } else if (spray) {
      accessory[i] = {
        uuid: spray.uuid,
        displayName: spray.displayName,
        displayIcon: spray.fullTransparentIcon,
        price: accessoryItem.Cost[VCurrencies.KC],
      };
    }
  }

  return {
    main,
    bundles,
    nightMarket,
    accessory,
    remainingSecs: {
      main:
        shop.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds ?? 0,
      bundles: shop.FeaturedBundle.Bundles.map(
        (bundle) => bundle.DurationRemainingInSeconds
      ) ?? [0],
      nightMarket: shop.BonusStore?.BonusStoreRemainingDurationInSeconds ?? 0,
      accessory:
        shop.AccessoryStore.AccessoryStoreRemainingDurationInSeconds ?? 0,
    },
  };
}

export async function getBalances(
  accessToken: string,
  entitlementsToken: string,
  region: string,
  userId: string
) {
  const res = await axios.request<WalletResponse>({
    url: getUrl("wallet", region, userId),
    method: "GET",
    headers: {
      ...extraHeaders(),
      Authorization: `Bearer ${accessToken}`,
      "X-Riot-Entitlements-JWT": entitlementsToken,
    },
  });

  return {
    vp: res.data.Balances[VCurrencies.VP],
    rad: res.data.Balances[VCurrencies.RAD],
    fag: res.data.Balances[VCurrencies.FAG],
    kc: res.data.Balances[VCurrencies.KC],
  };
}

export async function getProgress(
  accessToken: string,
  entitlementsToken: string,
  region: string,
  userId: string
) {
  const res = await axios.request<AccountXPResponse>({
    url: getUrl("playerxp", region, userId),
    method: "GET",
    headers: {
      ...extraHeaders(),
      Authorization: `Bearer ${accessToken}`,
      "X-Riot-Entitlements-JWT": entitlementsToken,
    },
  });

  return {
    level: res.data.Progress.Level,
    xp: res.data.Progress.XP,
  };
}

export const reAuth = (version: string) =>
  axios.request({
    url: "https://auth.riotgames.com/api/v1/authorization",
    method: "POST",
    headers: {
      "User-Agent": `RiotClient/${version} rso-auth (Windows; 10;;Professional, x64)`,
      "Content-Type": "application/json",
    },
    data: {
      client_id: "play-valorant-web-prod",
      nonce: "1",
      redirect_uri: "https://playvalorant.com/opt_in",
      response_type: "token id_token",
      response_mode: "query",
      scope: "account openid",
    },
    httpsAgent: new https.Agent({
      ciphers: [
        "TLS_CHACHA20_POLY1305_SHA256",
        "TLS_AES_128_GCM_SHA256",
        "TLS_AES_256_GCM_SHA384",
        "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256",
      ].join(":"),
      honorCipherOrder: true,
      minVersion: "TLSv1.2",
    }),
    withCredentials: true,
  });

function getUrl(name: string, region?: string, userId?: string) {
  const URLS: any = {
    auth: "https://auth.riotgames.com/api/v1/authorization/",
    entitlements: "https://entitlements.auth.riotgames.com/api/token/v1/",
    storefront: `https://pd.${region}.a.pvp.net/store/v3/storefront/${userId}`,
    wallet: `https://pd.${region}.a.pvp.net/store/v1/wallet/${userId}`,
    playerxp: `https://pd.${region}.a.pvp.net/account-xp/v1/players/${userId}`,
    weapons: "https://valorant-api.com/v1/weapons/",
    offers: `https://pd.${region}.a.pvp.net/store/v1/offers/`,
    name: `https://pd.${region}.a.pvp.net/name-service/v2/players`,
  };

  return URLS[name];
}



================================================
FILE: utils/valorant-assets.ts
================================================
import axios from "axios";
import { getVAPILang } from "./localization";
import * as FileSystem from "expo-file-system";

type StoredAssets = {
  riotClientVersion?: string;
  language?: string;
  skins: ValorantSkin[];
  buddies: ValorantBuddyAccessory[];
  sprays: ValorantSprayAccessory[];
  cards: ValorantCardAccessory[];
  titles: ValorantTitleAccessory[];
};

let assets: StoredAssets = {
  skins: [],
  buddies: [],
  sprays: [],
  cards: [],
  titles: [],
};
const FILE_LOCATION = FileSystem.cacheDirectory + "/valorant_assets.json";

export function getAssets() {
  return assets;
}

export async function loadAssets() {
  const { exists } = await FileSystem.getInfoAsync(FILE_LOCATION);
  const version = await fetchVersion();
  const language = getVAPILang();

  if (exists) {
    const storedAssets = await FileSystem.readAsStringAsync(FILE_LOCATION);
    const storedAssetsJson: StoredAssets = JSON.parse(storedAssets);

    if (
      storedAssetsJson.riotClientVersion === version &&
      storedAssetsJson.language === language
    ) {
      assets = storedAssetsJson;

      return;
    }
  }

  assets.riotClientVersion = version;
  assets.language = language;
  assets.skins = await fetchSkins(language);
  assets.buddies = await fetchBuddies(language);
  assets.sprays = await fetchSprays(language);
  assets.cards = await fetchPlayerCards(language);
  assets.titles = await fetchPlayerTitles(language);

  await FileSystem.writeAsStringAsync(FILE_LOCATION, JSON.stringify(assets));
}

export async function fetchVersion() {
  const res = await axios.request({
    url: "https://valorant-api.com/v1/version",
    method: "GET",
  });

  return res.data.data.riotClientVersion;
}

export async function fetchSkins(language?: string) {
  const res = await axios.request<{ data: ValorantSkin[] }>({
    url: `https://valorant-api.com/v1/weapons/skins?language=${
      language ?? getVAPILang()
    }`,
    method: "GET",
  });

  return res.data.data;
}

export async function fetchBuddies(language?: string) {
  const res = await axios.request<{ data: ValorantBuddyAccessory[] }>({
    url: `https://valorant-api.com/v1/buddies?language=${
      language ?? getVAPILang()
    }`,
    method: "GET",
  });

  return res.data.data;
}

export async function fetchSprays(language?: string) {
  const res = await axios.request<{ data: ValorantSprayAccessory[] }>({
    url: `https://valorant-api.com/v1/sprays?language=${
      language ?? getVAPILang()
    }`,
    method: "GET",
  });

  return res.data.data;
}

export async function fetchPlayerCards(language?: string) {
  const res = await axios.request<{ data: ValorantCardAccessory[] }>({
    url: `https://valorant-api.com/v1/playercards?language=${
      language ?? getVAPILang()
    }`,
    method: "GET",
  });

  return res.data.data;
}

export async function fetchPlayerTitles(language?: string) {
  const res = await axios.request<{ data: ValorantTitleAccessory[] }>({
    url: `https://valorant-api.com/v1/playertitles?language=${
      language ?? getVAPILang()
    }`,
    method: "GET",
  });

  return res.data.data;
}

export async function fetchBundle(bundleId: string, language?: string) {
  const res = await axios.request<{ data: ValorantBundle }>({
    url: `https://valorant-api.com/v1/bundles/${bundleId}?language=${
      language ?? getVAPILang()
    }`,
    method: "GET",
    validateStatus: () => true,
  });

  return res.status === 200 ? res.data.data : null;
}



================================================
FILE: utils/vshop-api.ts
================================================
import axios from "axios";

export const checkDonator = async (riotId: string) => {
  try {
    const res = await axios.request({
      url: `${process.env.EXPO_PUBLIC_API_URL}/user/${riotId}`,
      method: "GET",
      timeout: 5 * 1000,
    });

    return res.data.donator as boolean;
  } catch (e) {
    console.log(e);
  }
  return false;
};

export const getCurrencies = async () => {
  const res = await axios.request({
    url: `${process.env.EXPO_PUBLIC_API_URL}/stripe/currencies`,
    method: "GET",
  });

  return res.data as ICurrency[];
};

export const generatePaymentSheet = async ({
  amount,
  riotId,
  currencyCode,
}: {
  amount: number;
  riotId: string;
  currencyCode: string;
}) => {
  const res = await axios.request({
    url: `${process.env.EXPO_PUBLIC_API_URL}/stripe/payment-sheet`,
    method: "POST",
    data: {
      amount,
      riotId,
      currencyCode,
    },
  });

  return res;
};



================================================
FILE: utils/wishlist.ts
================================================
import { getAccessTokenFromUri, isSameDayUTC } from "./misc";
import {
  getEntitlementsToken,
  getShop,
  getUserId,
  reAuth,
} from "./valorant-api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import i18n, { getVAPILang } from "./localization";
import { checkDonator } from "./vshop-api";
import { useWishlistStore } from "~/hooks/useWishlistStore";
import * as Notifications from "expo-notifications";
import BackgroundFetch from "react-native-background-fetch";
import * as plausible from "./plausible";
import { fetchVersion } from "./valorant-assets";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NOTIFICATION_CHANNEL = "wishlist";

export async function wishlistBgTask() {
  await useWishlistStore.persist.rehydrate();
  const wishlistStore = useWishlistStore.getState();

  if (!wishlistStore.notificationEnabled) return;

  const lastWishlistCheckTs = Number.parseInt(
    (await AsyncStorage.getItem("lastWishlistCheck")) || "0"
  );
  const lastWishlistCheck = new Date(lastWishlistCheckTs);
  const now = new Date();
  console.log(
    `Last wishlist check ${lastWishlistCheck}, current date: ${now.getTime()}`
  );

  if (!isSameDayUTC(lastWishlistCheck, now) || lastWishlistCheckTs === 0) {
    plausible.capture("wishlist_check");

    console.log("New day, checking shop in the background");
    await checkShop(wishlistStore.skinIds);
    await AsyncStorage.setItem("lastWishlistCheck", now.getTime().toString());
  }

  console.log("No wishlist check needed");
}

export async function checkShop(wishlist: string[]) {
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL, {
    name: "Wishlist",
    importance: Notifications.AndroidImportance.MAX,
  });

  try {
    const version = await fetchVersion();

    // Automatic cookies: https://github.com/facebook/react-native/issues/1274
    const res = await reAuth(version);
    const accessToken = getAccessTokenFromUri(res.data.response.parameters.uri);
    const userId = getUserId(accessToken);

    // Check for donator
    const isDonator = await checkDonator(userId);
    if (!isDonator) return;

    const entitlementsToken = await getEntitlementsToken(accessToken);
    const region = (await AsyncStorage.getItem("region")) || "eu";
    const shop = await getShop(accessToken, entitlementsToken, region, userId);

    var hit = false;
    for (let i = 0; i < wishlist.length; i++) {
      if (shop.SkinsPanelLayout.SingleItemOffers.includes(wishlist[i])) {
        const skinData = await axios.get<{
          status: number;
          data: ValorantSkinLevel;
        }>(
          `https://valorant-api.com/v1/weapons/skinlevels/${
            wishlist[i]
          }?language=${getVAPILang()}`
        );
        await Notifications.scheduleNotificationAsync({
          content: {
            title: i18n.t("wishlist.name"),
            body: i18n.t("wishlist.notification.hit", {
              displayname: skinData.data.data.displayName,
            }),
          },
          trigger: {
            channelId: NOTIFICATION_CHANNEL,
            seconds: 1,
          },
        });
        hit = true;
      }
    }
    if (!hit) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.t("wishlist.name"),
          body: i18n.t("wishlist.notification.no_hit"),
        },
        trigger: {
          channelId: NOTIFICATION_CHANNEL,
          seconds: 1,
        },
      });
    }
  } catch (e) {
    console.log(e);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t("wishlist.name"),
        body: i18n.t("wishlist.notification.error"),
      },
      trigger: {
        channelId: NOTIFICATION_CHANNEL,
        seconds: 1,
      },
    });
  }
}

export async function initBackgroundFetch() {
  await BackgroundFetch.configure(
    {
      minimumFetchInterval: 15,
      stopOnTerminate: false,
      enableHeadless: true,
      startOnBoot: true,
      // Android options
      forceAlarmManager: false,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      requiresCharging: false,
      requiresDeviceIdle: false,
      requiresBatteryNotLow: false,
      requiresStorageNotLow: false,
    },
    async (taskId: string) => {
      await wishlistBgTask();
      BackgroundFetch.finish(taskId);
    },
    (taskId: string) => {
      console.log("[Fetch] TIMEOUT taskId:", taskId);
      BackgroundFetch.finish(taskId);
    }
  );
}

export async function stopBackgroundFetch() {
  await BackgroundFetch.stop();
}



================================================
FILE: .github/workflows/build-release.yaml
================================================
on:
  push:
    tags:
      - "v*"

name: Build release
jobs:
  build-apk:
    runs-on: ubuntu-latest
    steps:
      - name: 🏗 Checkout Repository
        uses: actions/checkout@v4

      - name: 🏗 Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          run_install: false

      - name: 🏗 Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: pnpm

      - name: 🏗 Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          packager: pnpm

      - name: 🏗 Setup Java 17
        uses: actions/setup-java@v4
        with:
          distribution: "zulu"
          java-version: "17"

      - name: 📦 Install dependencies
        run: pnpm install

      - name: 🚀 Build app
        run: eas build --local --non-interactive --platform android --profile production
        env:
          EXPO_PUBLIC_API_URL: ${{ secrets.API_URL }}
          EXPO_PUBLIC_STRIPE_PUBLIC_KEY: ${{ secrets.STRIPE_PUBLIC_KEY }}
          EXPO_PUBLIC_PLAUSIBLE_URL: ${{ secrets.PLAUSIBLE_URL }}
          EXPO_PUBLIC_PLAUSIBLE_DOMAIN: ${{ secrets.PLAUSIBLE_DOMAIN }}

      - name: Upload Artifact GitHub Action
        uses: actions/upload-artifact@v4
        with:
          name: vshop_apk
          path: build-*.apk

  build-ipa:
    runs-on: macos-14
    steps:
      - name: 🏗 Checkout Repository
        uses: actions/checkout@v4

      - name: 🏗 Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          run_install: false

      - name: 🏗 Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: pnpm

      - name: 🏗 Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          packager: pnpm

      - name: 📦 Install dependencies
        run: pnpm install

      - name: 📦 Expo prebuild
        run: pnpm prebuild:ios

      - name: 🔐 Create .env
        run: |
          touch .env
          echo EXPO_PUBLIC_API_URL=${{ secrets.API_URL }} >> .env
          echo EXPO_PUBLIC_STRIPE_PUBLIC_KEY=${{ secrets.STRIPE_PUBLIC_KEY }} >> .env
          echo EXPO_PUBLIC_PLAUSIBLE_URL=${{ secrets.PLAUSIBLE_URL }} >> .env
          echo EXPO_PUBLIC_PLAUSIBLE_DOMAIN=${{ secrets.PLAUSIBLE_DOMAIN }} >> .env

      - name: Build Archive
        run: |
          cd ios
          xcodebuild archive -workspace VShop.xcworkspace -scheme VShop -sdk iphoneos -archivePath output.xcarchive -configuration Release CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO | xcpretty && exit ${PIPESTATUS[0]}

      - name: Create IPA from Archive
        run: |
          cp -r ios/output.xcarchive/Products/Applications/ Payload/
          zip -r vshop.ipa Payload/

      - uses: actions/upload-artifact@v4
        name: Upload IPA
        with:
          name: vshop_ipa
          path: vshop.ipa

  create-release:
    needs: [build-apk, build-ipa]
    permissions:
      contents: write
    runs-on: ubuntu-latest

    steps:
      - name: 🏗 Checkout Repository
        uses: actions/checkout@v4

      - name: ⏬ Download Artifact Outputs - iOS
        uses: actions/download-artifact@v4
        with:
          name: vshop_ipa
          path: vshop_ipa

      - name: ⏬ Download Artifact Outputs - Android
        uses: actions/download-artifact@v4
        with:
          name: vshop_apk
          path: vshop_apk

      - name: 📃 Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          draft: true
          files: |
            vshop_ipa/**
            vshop_apk/**


