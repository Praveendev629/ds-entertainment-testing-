
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Search, X, ChevronRight, ChevronDown, Loader2, Film, Globe,
  Download, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
  Tv, Book, BookOpen, Trophy, Gamepad2, Smartphone, ExternalLink,
  Users, Star, TrendingUp, Clock, Heart, Share2, Filter, Mic
} from "lucide-react";

// Types for external links
interface ExternalLink {
  name: string;
  url: string;
  description?: string;
  category?: string;
  icon?: string;
}

interface Section {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  tabs: {
    id: string;
    name: string;
    links: ExternalLink[];
  }[];
}

interface Tab {
  id: string;
  name: string;
  links: ExternalLink[];
}

// External links data (Keeping data exactly as provided, focusing on code fixes)
const sectionsData: Section[] = [
  {
    id: "anime",
    name: "Anime",
    icon: Tv,
    description: "Watch anime from various streaming platforms",
    tabs: [
      {
        id: "streaming",
        name: "Streaming Sites",
        links: [
          { name: "AnimeKai", url: "https://animekai.to/home", description: "Hard Subs / Dub / Auto-Next / Status / Mirrors", category: "Anime" },
          { name: "Wotaku", url: "https://wotaku.wiki/websites", description: "Anime Site Index", category: "Anime" },
          { name: "The Index", url: "https://theindex.moe/library/anime", description: "Anime Site Index / Wiki", category: "Anime" },
          { name: "EverythingMoe", url: "https://everythingmoe.com/", description: "Anime Site Index", category: "Anime" },
          { name: "Miruro", url: "https://www.miruro.com/", description: "Hard Subs / Dub / Auto-Next", category: "Anime" },
          { name: "Anime Realms", url: "https://www.animerealms.org/", description: "Sub / Dub / Auto-Next", category: "Anime" },
          { name: "animepahe", url: "https://animepahe.com/", description: "Sub / Dub / Enhancements", category: "Anime" },
          { name: "KickAssAnime", url: "https://kaa.to/", description: "Sub / Dub / Auto-Next / Status", category: "Anime" },
          { name: "AnimeX", url: "https://animex.one/", description: "Sub / Dub / Auto-Next", category: "Anime" },
          { name: "Anidap", url: "https://anidap.se/", description: "Sub / Dub / Auto-Next", category: "Anime" },
          { name: "Animetsu", url: "https://animetsu.live/", description: "Sub / Dub", category: "Anime" },
          { name: "AniWatchTV", url: "https://aniwatchtv.to/", description: "Sub / Dub / Auto-Next", category: "Anime" },
          { name: "AniDoor", url: "https://anidoor.me/", description: "Sub / Dub / Auto-Next", category: "Anime" },
          { name: "AnimeHub", url: "https://animehub.ac/", description: "Sub / Dub / Auto-Next", category: "Anime" },
          { name: "AniZone", url: "https://anizone.to/", description: "Sub", category: "Anime" },
          { name: "AniHQ", url: "https://anihq.to/", description: "Sub / Dub", category: "Anime" },
          { name: "AnimeStream", url: "https://anime.uniquestream.net/", description: "Sub / 720p", category: "Anime" },
          { name: "FireAnime", url: "https://fireani.me/", description: "Sub", category: "Anime" },
          { name: "PirateXplay", url: "https://piratexplay.cc/home", description: "Sub / Mirrors", category: "Anime" },
          { name: "123anime", url: "https://123animes.ru/", description: "Sub / Dub / Auto-Next", category: "Anime" },
          { name: "AnimeYY", url: "https://animeyy.com/", description: "Sub / Dub", category: "Anime" },
          { name: "Kawaii Anime", url: "https://kawaii-anime.com/", description: "Sub / Dub", category: "Anime" },
          { name: "AnimeNoSub", url: "https://animenosub.to/", description: "Sub / Dub", category: "Anime" },
          { name: "Anisuge", url: "https://animesuge.cz/", description: "Sub / Dub / Auto-Next", category: "Anime" },
          { name: "Lunar", url: "https://lunaranime.ru/", description: "Sub / Dub / Auto-Next", category: "Anime" },
          { name: "Anoboye", url: "https://anoboye.com/", description: "Sub / Donghua", category: "Anime" },
          { name: "Senshi", url: "https://senshi.live/", description: "Sub / Dub / Auto-Next", category: "Anime" },
          { name: "AnimeParadise", url: "https://www.animeparadise.moe/", description: "Sub / Dub", category: "Anime" },
          { name: "KissAnime", url: "https://kissanime.com.ru/", description: "Sub / Dub / Auto-Next / Clones", category: "Anime" },
          { name: "AnimeOnsen", url: "https://animeonsen.xyz/", description: "Sub / 720p", category: "Anime" },
          { name: "AnimeXin", url: "https://animexin.dev/", description: "Donghua / Sub", category: "Anime" },
          { name: "LMANIME", url: "https://lmanime.com/", description: "Donghua / Sub", category: "Anime" },
          { name: "MyAnime", url: "https://myanime.live/", description: "Donghua / Sub", category: "Anime" },
          { name: "AnimeThemes", url: "https://animethemes.moe/", description: "Anime Themes", category: "Anime" },
          { name: "Seanime", url: "https://seanime.app/", description: "Desktop Streaming App", category: "Anime" },
          { name: "AnymeX", url: "https://anymex.vercel.app/", description: "Desktop Streaming App", category: "Anime" },
          { name: "Miru", url: "https://miru.js.org/en/", description: "Desktop Streaming App", category: "Anime" },
          { name: "YeAnime", url: "https://yenime.net/", description: "Sub / Dub", category: "Anime" },
          { name: "Anify", url: "https://anify.to/", description: "Sub / Dub", category: "Anime" },
          { name: "1Anime", url: "https://1ani.me/", description: "Sub / Dub", category: "Anime" },
          { name: "Kuudere", url: "https://kuudere.to/", description: "Sub / Dub", category: "Anime" },
          { name: "JustAnime", url: "https://justanime.to/", description: "Sub / Dub / Auto-Next / Mirrors", category: "Anime" },
          { name: "AniKuro", url: "https://anikuro.to/", description: "Sub / Dub / Status", category: "Anime" },
          { name: "Anime Nexus", url: "https://anime.nexus/", description: "Sub / Dub", category: "Anime" },
          { name: "Rive", url: "https://rivestream.org/", description: "Sub / Dub", category: "Anime" },
          { name: "GojoStream", url: "https://www.modsyndicate.com/", description: "Sub / Dub", category: "Anime" },
          { name: "Animelok", url: "https://animelok.xyz/", description: "Sub / Dub / Mirrors", category: "Anime" },
          { name: "Tokyo Insider", url: "https://www.tokyoinsider.com/", description: "Sub / Dub / Bulk Downloader", category: "Anime" },
          { name: "Kayoanime", url: "https://kayoanime.com/", description: "Sub / Dub / Requires Google Account", category: "Anime" },
          { name: "hi10anime", url: "https://hi10anime.com/", description: "Sub / Requires Sign-Up", category: "Anime" },
          { name: "Anime-Sharing", url: "https://www.anime-sharing.com/", description: "Sub / Dub / Anime / Manga Download Forum", category: "Anime" },
          { name: "Anime2Enjoy", url: "https://www.anime2enjoy.com/", description: "Sub", category: "Anime" },
          { name: "Animevilla", url: "https://animevilla.in/az-list/", description: "Sub / Dub / Some NSFW", category: "Anime" },
          { name: "AnimeSalt", url: "https://animesalt.top/", description: "Sub / Dub", category: "Anime" },
          { name: "anime7.download", url: "https://anime7.download/", description: "Sub", category: "Anime" },
          { name: "AnimeOut", url: "https://www.animeout.xyz/", description: "Sub / Requires Sign-Up", category: "Anime" },
          { name: "AnimeDDL", url: "https://www.animeddl.xyz/", description: "Sub / Dub", category: "Anime" },
          { name: "Nyaa", url: "https://nyaa.si/", description: "Sub / Dub / Anime Torrent", category: "Anime" },
          { name: "AnimeTosho", url: "https://animetosho.org/", description: "Sub / Dub / Anime Torrent", category: "Anime" },
          { name: "nekoBT", url: "https://nekobt.to/", description: "Sub / Dub / Anime Torrent", category: "Anime" },
          { name: "TokyoTosho", url: "https://www.tokyotosho.info/", description: "Sub / Anime Torrent", category: "Anime" },
          { name: "ShanaProject", url: "https://www.shanaproject.com/", description: "Sub / Anime Torrent", category: "Anime" },
          { name: "bakabt", url: "https://bakabt.me/", description: "Sub / Dub / Anime Torrent", category: "Anime" },
          { name: "Hayase", url: "https://hayase.watch/", description: "Torrent Streaming App", category: "Anime" },
          { name: "MAL", url: "https://myanimelist.net/", description: "Anime Ratings / Reviews / Tools", category: "Anime" },
          { name: "AniList", url: "https://anilist.co/", description: "Anime Ratings / Reviews / Tools", category: "Anime" },
          { name: "Taiga", url: "https://taiga.moe/", description: "Anime Tracking Program", category: "Anime" },
          { name: "Anime-Planet", url: "https://www.anime-planet.com/", description: "Anime Database", category: "Anime" },
          { name: "Kitsu", url: "https://kitsu.io/", description: "Anime Database", category: "Anime" },
          { name: "Anisearch", url: "https://www.anisearch.com/", description: "Anime Database", category: "Anime" },
          { name: "AniDB", url: "https://anidb.net/", description: "Anime Database", category: "Anime" },
          { name: "ACDB", url: "https://www.animecharactersdatabase.com/", description: "Anime Character Database", category: "Anime" },
          { name: "RelatedAnime", url: "https://relatedanime.com/", description: "Related Anime Index", category: "Anime" },
          { name: "AnimeStats", url: "https://anime-stats.net/", description: "Anime Recommendations", category: "Anime" },
          { name: "AnimeKarmaList", url: "https://animekarmalist.com/", description: "Anime Recommendations", category: "Anime" },
          { name: "Sprout", url: "https://anime.ameo.dev/", description: "Anime Recommendations", category: "Anime" },
        ]
      },
      ]
  },
  {
    id: "movies",
    name: "Movies",
    icon: Film,
    description: "Watch movies from various streaming platforms",
    tabs: [
      {
        id: "streaming",
        name: "Streaming Sites",
        links: [
           { name: "prime shows", url: "https://primeshows.uk/", description: "copy of AMAZON prime but fully free", category: "Official" },
         
         { name: "Moviesda", url: "https://moviesda31.com/", description: "watch and download all tamil movies", category: "Official" },
           { name: "isaidub", url: "https://isaidub.green/", description: "watch and download all english dubbed movies and series", category: "Official" },
           { name: "kutty movies", url: "https://kuttymovies1.free/", description: "Download all tamil and english dubbed movies and series at one plce", category: "Official" },
           { name: "tamil blasters", url: "https://tamilblasters.garden/", description: "watch and download all tamil and tamil dubbed movies", category: "Official" },
           { name: "movie rulz", url: "https://movierulz.hair/", description: "watch and download all tamil and english movies and series", category: "Official" },
 { name: "Net mirror", url: "https://netmirror.gg/", description: "Copy of NETFLIX", category: "Official" },
          { name: "CORS FLIX", url: "https://watch.corsflix.dpdns.org/", description: "every language movies and series is available", category: "Official" },
          { name: "show box", url: "https://www.showbox.media/", description: "watch and download all tamil and english movies and series", category: "Official" },
          { name: "XPrime ", url: "https://xprime.stream/", description: "All movies and series are aviailable with download option ", category: "Official" },
          { name: "cineby", url: "https://www.cineby.sc/", description: "Multi language movies and series availabe", category: "Official" },
          { name: "cineb", url: "https://arydigitel.tv/home", description: "watch movies and series at online ", category: "Official" },
          
          { name: "stream m4u", url: "https://streamm4u.com.co/", description: "watch tamil and english movies and series", category: "Official" },
          { name: "Flicker", url: "https://flickr-mini.pages.dev/", description: "watch tamil and english and dub movies and series", category: "Official" },
          { name: "Watch32", url: "https://watch32.sx/", description: "Tamil and english movies and series streaming site but more redirecting is issue", category: "Official" },
        { name: "Watch series", url: "https://watchseries.pe/", description: "Watch tamil and other language movies and series at online", category: "Official" },
        { name: "Putlocker", url: "https://putlocker.pe/", description: "Watch tamil and other language movies and series at online ", category: "Official" },
        { name: "Vidplay ", url: "https://vidplay.top/", description: "watch all tamil and english movies and series at online with out AD", category: "Official" },
        { name: "HD today", url: "https://hdtoday.cc/", description: "Watch tamil and other language movies and series at online ", category: "Official" },
        { name: "Rido movies", url: "https://ridomovies.tv/home-rd1", description: "watch all tamil and english movies and series at online with out AD", category: "Official" },
        { name: "Cineby tv", url: "https://cinebytv.com/", description: "watch all tamil and english movies and series at online with out AD", category: "Official" },
        { name: "Hurrah watch", url: "https://hurawatch.cc/home", description: "Tamil and english movies and series streaming site", category: "Official" },
        { name: "Flix hq", url: "https://flixhq.to/home", description: "copy of HURRAH watch", category: "Official" },
        { name: "My Flixerz", url: "https://myflixerz.to/home", description: "copy of HURRAH watch", category: "Official" },
        { name: "The flixer tv", url: "https://theflixertv.to/home", description: "copy of MY flixerz", category: "Official" },
        { name: "Sflix", url: "https://sflix.ps/home", description: "copy of theflixertv", category: "Official" },
         { name: "soap2dayhdz", url: "https://ww3.soap2dayhdz.com/home/", description: "Watch all hollyhood movies series and tv shows free at online", category: "Official" },
        { name: "moviesjoytv", url: "https://moviesjoytv.to/home", description: "copy of HURRAH watch but more redirecting issue", category: "Official" },
        { name: "pressplayz", url: "https://pressplayz.to/", description: "Watch all movies series and tv shows free at online", category: "Official" },
        { name: "lookmovie2", url: "https://www.lookmovie2.to/", description: "you can watch moovies online or dodwwnload for offline viewing", category: "Official" },
        { name: "onionplay", url: "https://onionplay.io/", description: "Watch all any movies series and tv shows free at online", category: "Official" },
       { name: "pop corn movies", url: "https://popcornmovies.org/", description: "Watch any movies series and tv shows free at online", category: "Official" },
         { name: "goojara", url: "https://ww1.goojara.to/", description: "Watch any movies series and tv shows free at online", category: "Official" },
         { name: "flixer", url: "https://flixer.su/", description: "Copy of NTFLIX", category: "Official" },
         { name: "cinema bz", url: "https://cinema.bz/", description: "Watch any movies series and tv shows free at online by chnging server you wil able to download video", category: "Official" },
         { name: "yflix", url: "https://yflix.to/home", description: "Watch any movies series and tv shows free at online", category: "Official" },
          { name: "fmovies", url: "https://ww2-fmovies.com/", description: "Watch any movies series and tv shows free at online", category: "Official" },
         { name: "flicky stream", url: "https://flickystream.ru/", description: "Watch any movies series and tv shows free at online multiple servers provided", category: "Official" },
         { name: "hydra hd", url: "https://hydrahd.ru/", description: "Watch any movies series and tv shows free at online", category: "Official" },
         { name: "dora watch", url: "https://dorawatch.one/home/", description: "Watch any hollyhood  movies series and tv shows free at online", category: "Official" },
         { name: "wmovies", url: "https://wmovies.one/home/", description: "copy of DORA watch but redirects are more", category: "Official" },
         { name: "ramo flix", url: "https://ramoflix.net/", description: "copy of DORA watch but redirects are more", category: "Official" },
         { name: "hydra hd", url: "https://hydrahd.ru/", description: "Watch any movies series and tv shows free at online", category: "Official" },
         
        ]
      },
      {
        id: "apps",
        name: "Mobile Apps",
        links: [
          { name: "movie box", url: "https://www.moviesbox.com.co/home/", description: "India's top streaming app - Download from official site", category: "Android" },
       
           { name: "CineHD", url: "https://cinehd.xyz/download/global/CineHD-v1.1.3-(Universal).apk", description: "Watch Movies, TV Shows, Animes - Direct APK download", category: "Android" },
          { name: "Nxsha", url: "https://github.com/dev-alessiorizzo/nxsha-apk/releases/download/V2.1/Nxsha-v2.1-.Universal.apk", description: "Stream movies, series, anime and K-dramas - Direct APK download", category: "Android" },
          { name: "Vega App", url: "https://github.com/vega-org/vega-app/releases", description: "Movies and TV streaming app - APK available on GitHub", category: "Android" },
          { name: "CloudStream", url: "https://github.com/recloudstream/cloudstream/releases", description: "Android app for streaming and downloading media - APK available on GitHub", category: "Android" },
          { name: "MovieDB", url: "https://github.com/WirelessAlien/MovieDB/releases", description: "TMDB app for exploring and organizing movies - APK available on GitHub", category: "Android" },
          { name: "Flixclusive", url: "https://github.com/flixclusiveorg/Flixclusive/releases", description: "Media3 player application for movies and TV - APK available on GitHub", category: "Android" },
          { name: "LokLok", url: "https://loklok.com/download", description: "Movies and TV streaming app - Download from official site", category: "Android" },
          { name: "MovieBox", url: "https://www.movieboxhd.com.co/download-moviebox-file/", description: "Stream HD movies, TV shows, sports, anime - Direct APK download", category: "Android" },
          { name: "PlayTorrio", url: "https://github.com/ayman708-UX/PlayTorrioV2/releases/latest/download/app-arm64-v8a-release.apk", description: "Ultimate entertainment hub - Movies, TV, Anime, Sports - Direct APK download", category: "Android" },
          { name: "FreeTV", url: "https://github.com/phstudio2/FreeTV/releases", description: "Free TV app for live streaming - APK available on GitHub", category: "Android" },
          { name: "HD Streamz", url: "https://ahdsjegeryfgergfeferfer6.coreedge.ru//apk/HD_STREAMZ_Latest_3.10.1-a-179_07-Feb-26_4546446_enc.apk", description: "Live TV streaming app with 1000+ channels - Direct APK download", category: "Android" },
          { name: "Multi Streamz", url: "https://multistreamz.com/wp-content/uploads/2025/08/MultiStreamz-2.2-release.apk", description: "1500+ live TV channels from 15 countries - Direct APK download", category: "Android" },
          { name: "OnStream", url: "https://onstreamapp.app/files/onstream-mobile-1.1.7.apk", description: "Free HD movies and TV shows streaming - Direct APK download", category: "Android" },
          { name: "Ringz", url: "https://apkhosto.com/Hbr2vgwf3kjoBAF/file", description: "Movies, TV shows, series, dramas streaming - Direct APK download", category: "Android" },
          { name: "PikaShow", url: "https://pikashow.com.ro/", description: "India's top streaming app for live cricket, TV shows, and OTT videos - Download from official site", category: "Android" },
        ]
      }
    ]
  },
  {
    id: "applications",
    name: "Applications",
    icon: Smartphone,
    description: "Apps for watching anime and movies",
    tabs: [
      {
        id: "android",
        name: "Android Apps",
        links: [
          { name: "VLC", url: "https://play.google.com/store/apps/details?id=org.videolan.vlc", description: "Media player", category: "Player" },
          { name: "MX Player", url: "https://play.google.com/store/apps/details?id=com.mxtech.videoplayer.ad", description: "Video player", category: "Player" },
          { name: "Kodi", url: "https://play.google.com/store/apps/details?id=org.xbmc.kodi", description: "Media center", category: "Player" },
          { name: "Plex", url: "https://play.google.com/store/apps/details?id=com.plexapp.android", description: "Media server", category: "Server" },
        ]
      },
      {
        id: "ios",
        name: "iOS Apps",
        links: [
          { name: "VLC", url: "https://apps.apple.com/us/app/vlc-for-mobile/id650377962", description: "Media player", category: "Player" },
          { name: "Infuse", url: "https://apps.apple.com/us/app/infuse-7/id1136220934", description: "Video player", category: "Player" },
          { name: "Plex", url: "https://apps.apple.com/us/app/plex/id383455673", description: "Media server", category: "Server" },
        ]
      }
    ]
  },
  {
    id: "books",
    name: "Books",
    icon: Book,
    description: "Read books from various platforms",
    tabs: [
      {
        id: "ebooks",
        name: "E-Book Platforms",
        links: [
         { name: "z-lib.fm", url: "https://z-lib.fm/", description: "Free e-books library", category: "Free" },
          { name: "annas-archive.gl", url: "https://annas-archive.gl/", description: "Free e-books archive", category: "Free" },
          { name: "libgen.li", url: "https://libgen.li/", description: "Library Genesis e-books", category: "Free" },
          { name: "ebook-hunter.org", url: "https://ebook-hunter.org/", description: "E-book search engine", category: "Free" },
          { name: "galaxyaudiobook.com", url: "https://galaxyaudiobook.com/", description: "Free audiobooks", category: "Audiobook" },
          { name: "audiobookbay.lu", url: "https://audiobookbay.lu/", description: "Free audiobooks", category: "Audiobook" },
          { name: "nepu.to", url: "https://nepu.to/ebooks", description: "Free e-books and audiobooks", category: "Free" },
          { name: "Open Slum", url: "https://open-slum.pages.dev/", description: "Book Site Index / Uptime Tracking", category: "Free" },
          { name: "Anna's Archive", url: "https://annas-archive.gl/", description: "Books / Comics / Mirrors / Matrix", category: "Free" },
          { name: "Z-Library", url: "https://z-lib.gd/", description: "Books / Comics / Apps / Extensions", category: "Free" },
          { name: "Mobilism", url: "https://forum.mobilism.me/", description: "Books / Audiobooks / Magazines / Newspapers / Comics", category: "Free" },
          { name: "MyAnonaMouse", url: "https://www.myanonamouse.net/", description: "Books / Audiobooks / Comics / Sheet Music", category: "Free" },
          { name: "Library Genesis", url: "https://libgen.li/", description: "Books / Comics / Manga / Tools / Mirrors", category: "Free" },
          { name: "Rave", url: "https://ravebooksearch.com/", description: "Multi-Site Book Search", category: "Free" },
          { name: "Reading CSE", url: "https://cse.google.com/cse?cx=006516753008110874046:s9ddesylrm8", description: "Multi-Site Book Search", category: "Free" },
          { name: "WeLib", url: "https://welib.org/", description: "Anna's Archive Mirror", category: "Free" },
          { name: "eBookBB", url: "https://ebookbb.in/", description: "Books / Download", category: "Free" },
          { name: "iBookPile", url: "https://ibookpile.in/", description: "Books / Download", category: "Free" },
          { name: "Liber3", url: "https://liber3.eth.limo/", description: "Book Search / Download", category: "Free" },
          { name: "BookSee", url: "https://en.booksee.org/", description: "Book Search / Download", category: "Free" },
          { name: "eBookoz", url: "https://ebookoz.net/", description: "Books", category: "Free" },
          { name: "Bookstagram", url: "https://vk.com/bookstagram_eng", description: "Books / Magazines / VK", category: "Free" },
          { name: "dpgroup", url: "https://www.dpgroup.org/", description: "Books / Magazines / Sign-Up", category: "Free" },
          { name: "Library Land", url: "https://library.land/", description: "Books / Online Reading", category: "Free" },
          { name: "BookFrom.net", url: "https://www.bookfrom.net/", description: "Books / Online Reading", category: "Free" },
          { name: "Novel12", url: "https://novel12.com/", description: "Books / Online Reading", category: "Free" },
          { name: "ReadOnlineFreeBook", url: "https://readonlinefreebook.com/", description: "Books / Online Reading", category: "Free" },
          { name: "FreeBannedBooks", url: "https://freebannedbooks.org/", description: "US Banned Books", category: "Free" },
          { name: "Inventaire", url: "https://inventaire.io/", description: "Community Library / Book Lending", category: "Free" },
          { name: "Shelfmark", url: "https://github.com/calibrain/shelfmark", description: "Ebook Downloader", category: "Tools" },
          { name: "Calibre", url: "https://calibre-ebook.com/", description: "Ebook Manager / Downloader / Libraries / Tools", category: "Tools" },
          { name: "Flibusta", url: "https://flibusta.is/", description: "Russian Ebook Library / Sign-Up", category: "Free" },
          { name: "The Free Book Library", url: "https://ebooks.i2p/", description: "Requires I2P", category: "Free" },
          { name: "r/FreeEBOOKS", url: "https://reddit.com/r/FreeEBOOKS", description: "Ebook Subreddit", category: "Community" },
          { name: "Book Search Guide", url: "https://docs.google.com/document/d/1ZwWs8JOrlkrrqiHwkQSwc4_NM85Zbzc9t9ifQ1rHZgM/mobilebasic", description: "Guide to Finding Articles / Books", category: "Tools" },
        ]
      }
    ]
  },
  {
    id: "manga",
    name: "Manga",
    icon: BookOpen,
    description: "Read manga from various platforms",
    tabs: [
      {
        id: "official",
        name: "Official Platforms",
        links: [
          { name: "Manga Plus", url: "https://mangaplus.shueisha.co.jp", description: "Shueisha's manga platform", category: "Official" },
          { name: "VIZ Media", url: "https://www.viz.com", description: "Official manga publisher", category: "Official" },
          { name: "Crunchyroll Manga", url: "https://www.crunchyroll.com/comics/manga", description: "Manga from Crunchyroll", category: "Official" },
          { name: "Kodansha", url: "https://kodansha.us", description: "Manga publisher", category: "Official" },
        ]
      },
      {
        id: "comics",
        name: "Comics & Manga Sites",
        links: [
          { name: "ReadComicsOnline", url: "https://readcomiconline.li/", description: "Online comics reader", category: "Comics" },
          { name: "BatCave", url: "https://batcave.biz/", description: "May Require VPN", category: "Comics" },
          { name: "GetComics", url: "https://getcomics.org/", description: "Download Comics", category: "Comics" },
          { name: "ComicBookPlus", url: "https://comicbookplus.com/", description: "Golden Age Comics", category: "Comics" },
          { name: "Explosm", url: "https://explosm.net/rcg", description: "Cyanide & Happiness Webcomics", category: "Comics" },
          { name: "xkcd", url: "https://xkcd.com/", description: "Webcomics", category: "Comics" },
          { name: "Comic CSE", url: "https://cse.google.com/cse?cx=006516753008110874046:p4hgytyrohg", description: "Multi-Site Comic Search", category: "Comics" },
          { name: "XOXO Comics", url: "https://xoxocomic.com/", description: "Webcomics", category: "Comics" },
          { name: "ReadAllComics", url: "https://readallcomics.com/", description: "Online comics reader", category: "Comics" },
          { name: "Read Comics Online", url: "https://readcomicsonline.ru/", description: "Online comics reader", category: "Comics" },
          { name: "4chan /co/", url: "https://boards.4channel.org/co/catalog", description: "Weekly Downloads", category: "Comics" },
          { name: "ZipComic", url: "https://www.zipcomic.com/", description: "Comic downloads", category: "Comics" },
          { name: "OldComicsWorld", url: "https://oldcomicsworld.blogspot.com/", description: "Golden Age Comic Downloads", category: "Comics" },
          { name: "DigitalComicMuseum", url: "https://digitalcomicmuseum.com/", description: "Golden Age Comic Downloads", category: "Comics" },
          { name: "Comics Kingdom", url: "https://comicskingdom.com/", description: "Comics Strips", category: "Comics" },
          { name: "GoComics", url: "https://www.gocomics.com/", description: "Comics Strips", category: "Comics" },
          { name: "SMBC", url: "https://www.smbc-comics.com/", description: "Webcomics", category: "Comics" },
          { name: "The Oatmeal", url: "https://theoatmeal.com/", description: "Webcomics", category: "Comics" },
          { name: "Hiveworks Comics", url: "https://www.thehiveworks.com/", description: "Webcomics", category: "Comics" },
          { name: "Loading Artist", url: "https://loadingartist.com/", description: "Webcomics", category: "Comics" },
          { name: "Wotaku", url: "https://wotaku.wiki/websites", description: "Manga Sites Index", category: "Manga" },
          { name: "The Index", url: "https://theindex.moe/library/manga", description: "Manga Sites Index / Wiki", category: "Manga" },
          { name: "EverythingMoe", url: "https://everythingmoe.com/section/manga", description: "Manga Sites Index", category: "Manga" },
          { name: "Weeb Central", url: "https://weebcentral.com/", description: "Multi Site Web Client", category: "Manga" },
          { name: "Comix", url: "https://comix.to/", description: "Multi Site Web Client", category: "Manga" },
          { name: "MangaFire", url: "https://mangafire.to/", description: "Multi Site Web Client", category: "Manga" },
          { name: "MangaDex", url: "https://mangadex.org/", description: "Downloader / Script", category: "Manga" },
          { name: "Atsumaru", url: "https://atsu.moe/", description: "Manga reader", category: "Manga" },
          { name: "MangaNato", url: "https://www.manganato.gg/", description: "Multi Site Web Client", category: "Manga" },
          { name: "Kagane", url: "https://kagane.org/", description: "Manhwa", category: "Manga" },
          { name: "OniSaga", url: "https://onisaga.com/", description: "MangaBuddy, MangaForest or MangaMirror", category: "Manga" },
          { name: "MangaBall", url: "https://mangaball.net/", description: "Mangapill or Otaku Oasis", category: "Manga" },
          { name: "Mangadotnet", url: "https://mangadot.net/", description: "MangaHere or MangaFox", category: "Manga" },
          { name: "Rive Manga", url: "https://rivestream.org/manga", description: "Manga reader", category: "Manga" },
          { name: "MangaTown", url: "https://www.mangatown.com/", description: "Manga reader", category: "Manga" },
          { name: "The Manga Library", url: "https://rentry.co/FMHYB64", description: "Manga collection", category: "Manga" },
          { name: "MangaHub", url: "https://mangahub.io/", description: "Manga reader", category: "Manga" },
          { name: "MangaBerri", url: "https://mangaberri.com/", description: "Multi Site Web Client", category: "Manga" },
          { name: "Mgeko", url: "https://www.mgeko.cc/", description: "Manhwa / Manhua", category: "Manga" },
          { name: "Webtoon Official", url: "https://discord.com/invite/webtoonofficial", description: "Manhwa", category: "Manga" },
          { name: "Toonily", url: "https://toonily.com/", description: "Manhwa / Some NSFW", category: "Manga" },
          { name: "ManhwaClan", url: "https://manhwaclan.com/", description: "Manhwa", category: "Manga" },
          { name: "AquaReader", url: "https://aquareader.net/", description: "Manhua", category: "Manga" },
          { name: "SysManhua", url: "https://sysmanhua.com/", description: "Manhua", category: "Manga" },
          { name: "Nyaa Manga / LNs", url: "https://nyaa.si/?f=0&c=3_0&q=", description: "Torrents", category: "Manga" },
          { name: "MangaKatana", url: "https://mangakatana.com/", description: "Torrents", category: "Manga" },
          { name: "MangaUpdates", url: "https://www.mangaupdates.com/", description: "Manga Database / Releases Updates", category: "Database" },
          { name: "Manga CSE", url: "https://cse.google.com/cse?cx=006516753008110874046:a5mavctjnsc", description: "Multi-Site Manga Search", category: "Manga" },
          { name: "PlayTorrio", url: "https://playtorrio.xyz/", description: "Manga App", category: "Apps" },
          { name: "Seanime", url: "https://seanime.app/", description: "Self-Hosted Manga App", category: "Apps" },
          { name: "Webcomic Reader", url: "https://openuserjs.org/scripts/anka-213/Webcomic_Reader", description: "Preloads Images, Remembers Progress and Keyboard Support", category: "Tools" },
          { name: "Manga-Manager", url: "https://github.com/MangaManagerORG/Manga-Manager", description: "Manga Managers", category: "Tools" },
          { name: "Komga", url: "https://komga.org/", description: "Comic / Manga Media Server", category: "Server" },
        ]
      }
    ]
  },
  {
    id: "sports",
    name: "Live Sports",
    icon: Trophy,
    description: "Watch live sports from various platforms",
    tabs: [
      {
        id: "live-tv",
        name: "Live TV",
        links: [
          { name: "TVCL", url: "https://www.tvchannellists.com/", description: "TV Channel Index", category: "Live TV" },
          { name: "StreamSports99", url: "https://streamsports99.ru/live-tv", description: "TV / Sports / Mirrors / Bypass Blocks", category: "Live TV" },
          { name: "NTV", url: "http://ntv.cx/", description: "TV / Sports / Aggregator / Mirrors", category: "Live TV" },
          { name: "Famelack", url: "https://famelack.com/", description: "TV / Sports", category: "Live TV" },
          { name: "EasyWebTV", url: "https://zhangboheng.github.io/Easy-Web-TV-M3u8/routes/countries.html", description: "TV / Sports", category: "Live TV" },
          { name: "IPTV Web", url: "https://iptv-web.app/", description: "TV / Sports", category: "Live TV" },
          { name: "RgShows", url: "https://www.rgshows.ru/livetv/", description: "TV / Sports", category: "Live TV" },
          { name: "DaddyLive TV", url: "https://dlstreams.top/24-7-channels.php", description: "TV / Sports / Mirrors", category: "Live TV" },
          { name: "TVPass", url: "https://tvpass.org/", description: "TV / Sports / US Only", category: "Live TV" },
          { name: "TitanTV", url: "https://titantv.com/", description: "Live TV Listings / TV Schedule", category: "Live TV" },
          { name: "TV Freedom", url: "https://tvfreedom.pages.dev/", description: "TV / Sports / Mirrors", category: "Live TV" },
          { name: "Xumo Play", url: "https://play.xumo.com/networks", description: "TV / US Only", category: "Live TV" },
          { name: "Pluto", url: "https://pluto.tv/live-tv", description: "TV / Sports / US Only", category: "Live TV" },
          { name: "huhu.to", url: "https://huhu.to/", description: "TV / Sports / European", category: "Live TV" },
          { name: "vavoo.to", url: "https://vavoo.to/", description: "TV / Sports / European", category: "Live TV" },
          { name: "kool.to", url: "https://kool.to/", description: "TV / Sports / European", category: "Live TV" },
          { name: "oha.to", url: "https://oha.to/", description: "TV / Sports / European", category: "Live TV" },
          { name: "LiveHDTV", url: "https://www.livehdtv.com/", description: "TV", category: "Live TV" },
          { name: "CineBolt TV", url: "https://cinebolt.net/live", description: "TV / Sports", category: "Live TV" },
          { name: "Movish TV", url: "https://movish.net/live-broadcasts", description: "TV / Sports", category: "Live TV" },
          { name: "SportsBite", url: "https://live.moviebite.cc/channels", description: "TV / Sports", category: "Live TV" },
          { name: "Globe TV", url: "https://globetv.app/", description: "TV / Sports", category: "Live TV" },
          { name: "uFreeTV", url: "https://ufreetv.com/", description: "TV", category: "Live TV" },
          { name: "TV247US", url: "https://tv247us.vip/", description: "TV / Sports", category: "Live TV" },
          { name: "SportOnTV", url: "https://sportontv.biz/", description: "TV / Sports", category: "Live TV" },
          { name: "SportDB TV", url: "https://hoofoot.ru/tv/", description: "TV / Sports", category: "Live TV" },
          { name: "Heartive", url: "https://heartiveloves.pages.dev/live/", description: "TV / Sports", category: "Live TV" },
          { name: "CXtv", url: "https://www.cxtvlive.com/", description: "TV / Sports", category: "Live TV" },
          { name: "lmao.love", url: "https://lmao.love/channels/", description: "TV / Sports", category: "Live TV" },
          { name: "WatchTVs", url: "https://watchtvs.live/", description: "TV", category: "Live TV" },
          { name: "Cubik TV", url: "https://cubiktv.com/", description: "TV / Sports", category: "Live TV" },
          { name: "Rive Live", url: "https://rivestream.org/iptv", description: "TV / Sports", category: "Live TV" },
          { name: "Zerostream", url: "https://zerostream.alwaysdata.net/", description: "Movies / TV / Anime", category: "Live TV" },
          { name: "iShowMovies", url: "https://ishowmovies.org/live", description: "TV", category: "Live TV" },
          { name: "FreeInterTV", url: "http://www.freeintertv.com/", description: "TV / Sports", category: "Live TV" },
          { name: "Global Free TV", url: "https://www.globalfreetv.com/", description: "TV", category: "Live TV" },
          { name: "vipotv", url: "https://vipotv.com/", description: "TV / Sports", category: "Live TV" },
          { name: "SquidTV", url: "https://www.squidtv.net/", description: "TV", category: "Live TV" },
          { name: "s7-tv", url: "https://s7-tv.blogspot.com/p/t.html", description: "TV", category: "Live TV" },
          { name: "DistroTV", url: "https://distro.tv/", description: "TV", category: "Live TV" },
          { name: "Puffer", url: "https://puffer.stanford.edu/", description: "San Fran TV / Requires Sign-Up", category: "Live TV" },
          { name: "cytube", url: "https://cytu.be/", description: "Random Streams", category: "Live TV" },
          { name: "VaughnLive", url: "https://vaughn.live/browse/misc", description: "Random Streams", category: "Live TV" },
          { name: "React.tv", url: "https://react.tv/", description: "Random Streams", category: "Live TV" },
          { name: "psp-tv", url: "http://sync.coconono.org", description: "Random Streams", category: "Live TV" },
          { name: "Baked", url: "https://baked.live/", description: "Random Streams", category: "Live TV" },
          { name: "Channel 99", url: "https://www.pracdev.org/channel99/", description: "Random Streams", category: "Live TV" },
          { name: "EXP TV", url: "https://linktr.ee/exp.tv", description: "Rare / Vintage / Obscure Media Stream", category: "Live TV" },
          { name: "YTCH", url: "https://ytch.tv/", description: "Random TV Style YouTube / Custom Channels", category: "Live TV" },
          { name: "Channel Surfer", url: "https://channelsurfer.tv/", description: "Random TV Style YouTube / Custom Channels", category: "Live TV" },
          { name: "FreeTVz", url: "https://freetvz.com/", description: "Random TV Style YouTube / Custom Channels", category: "Live TV" },
          { name: "TV.Jest", url: "https://tv.jest.one/", description: "News", category: "Live TV" },
          { name: "Split TV", url: "https://split-tv.co.il/", description: "News", category: "Live TV" },
          { name: "WorldNews24", url: "https://worldnews24.tv/", description: "News", category: "Live TV" },
          { name: "SHOWROOM", url: "https://showroom-live.com/", description: "Live Performance Broadcasts", category: "Live TV" },
          { name: "Koryo TV", url: "https://koryo.tv/", description: "North Korean Live TV", category: "Live TV" },
          { name: "KCNA", url: "https://kcnawatch.us/korea-central-tv-livestream", description: "North Korean Live TV", category: "Live TV" },
        ]
      },
      {
        id: "live-sports",
        name: "Live Sports",
        links: [
          { name: "sport calendars", url: "https://dan.valeena.dev/guides/sports-calendar", description: "Importable Sports Calendars", category: "Live Sports" },
          { name: "Streamed", url: "https://streamed.pk/", description: "Stream Aggregator / Mirrors", category: "Live Sports" },
          { name: "SportyHunter", url: "https://sportyhunter.com/", description: "Community Aggregator", category: "Live Sports" },
          { name: "StreamSports99", url: "https://streamsports99.ru", description: "Mirrors / Bypass Blocks", category: "Live Sports" },
          { name: "WatchSports", url: "https://watchsports.to/", description: "Stream Aggregator", category: "Live Sports" },
          { name: "BINTV", url: "https://bintv.net/", description: "TV / Sports", category: "Live Sports" },
          { name: "NTV", url: "http://ntv.cx/", description: "TV / Sports / Aggregator / Mirrors", category: "Live Sports" },
          { name: "Watch Footy", url: "https://watchfooty.st/", description: "Stream Aggregator / Mirrors", category: "Live Sports" },
          { name: "Sporting77", url: "https://sporting77.ru//", description: "TV / Sports", category: "Live Sports" },
          { name: "DaddyLive", url: "https://dlstreams.top/", description: "TV / Sports / Mirrors", category: "Live Sports" },
          { name: "SportsBite", url: "https://sportsbite.cv/", description: "Status", category: "Live Sports" },
          { name: "StreamEast", url: "https://streameast.ga/", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "LiveTV", url: "https://livetv.sx/enx/", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "TimStreams", url: "https://timstreams.net/", description: "Live Events", category: "Live Sports" },
          { name: "StreamFree", url: "https://streamfree.app", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "Sportsurge", url: "https://v2.sportsurge.net/home5/", description: "Stream Aggregator", category: "Live Sports" },
          { name: "TotalSportek", url: "https://totalsportek.events/", description: "Stream Aggregator", category: "Live Sports" },
          { name: "SportDB", url: "https://hoofoot.ru/", description: "Stream Aggregator", category: "Live Sports" },
          { name: "Superstrim", url: "https://superstrim.pages.dev/", description: "Stream Aggregator", category: "Live Sports" },
          { name: "DaddyLiveHD", url: "https://daddylive.pw/", description: "Stream Aggregator", category: "Live Sports" },
          { name: "FootStreams", url: "https://footstreams.xyz/", description: "Stream Aggregator", category: "Live Sports" },
          { name: "Ask4Sports", url: "https://ask4sport.xyz/", description: "Stream Aggregator", category: "Live Sports" },
          { name: "FSL", url: "https://freestreams-live1a.pk/", description: "Stream Aggregator", category: "Live Sports" },
          { name: "Footfy", url: "https://footfy.net/", description: "Stream Aggregator", category: "Live Sports" },
          { name: "1Ball", url: "https://1ball.pk/", description: "Stream Aggregator", category: "Live Sports" },
          { name: "StreamCorner", url: "https://streamcorner.info/", description: "Status", category: "Live Sports" },
          { name: "GamesCentral", url: "https://www.gamescentral.top/", description: "Live Gaming Streams", category: "Live Sports" },
          { name: "CosecTV", url: "https://cosectv.com/", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "CricHD", url: "https://crichd.at/", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "FalconStreams", url: "https://falconstreams.com/v2", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "MainPortal66", url: "https://mainportal66.com/", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "PPV.TO", url: "https://ppv.to/", description: "Live Events / Mirrors", category: "Live Sports" },
          { name: "l1l1", url: "https://l1l1.link/", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "FCTV33", url: "https://www.fctv33.lat/", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "MrGamingStreams", url: "http://mrgamingstreams.org/", description: "Status", category: "Live Sports" },
          { name: "Sports Plus", url: "https://en12.sportplus.live/", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "VIP Box Sports", url: "https://www.viprow.co/", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "720pStream", url: "https://720pstream.lc/", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "BuffStream", url: "https://app.buffstream.io/", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "FawaNews", url: "http://www.fawanews.sc/", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "SharkStreams", url: "https://sharkstreams.net/", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "CrackStreams.ms", url: "https://crackstreams.ms/", description: "Live Sports Streaming", category: "Live Sports" },
          { name: "MyFootball", url: "https://myfootball.pw/", description: "Football", category: "Live Sports" },
          { name: "KilatLIVE", url: "https://kilatlive.net/", description: "Football", category: "Live Sports" },
          { name: "NBAMonster", url: "https://nbamonster.com/", description: "Basketball / Aggregator", category: "Live Sports" },
          { name: "WebCric", url: "https://me.webcric.com/", description: "Cricket", category: "Live Sports" },
          { name: "OnHockey", url: "https://onhockey.tv/", description: "Hockey / Aggregator", category: "Live Sports" },
          { name: "Pitsport", url: "https://pitsport.live/", description: "Motorsports", category: "Live Sports" },
          { name: "OvertakeFans", url: "https://overtakefans.com/", description: "Motorsports", category: "Live Sports" },
          { name: "Aceztrims", url: "https://acestrlms.pages.dev/", description: "Motorsports", category: "Live Sports" },
          { name: "DD12", url: "https://dd12streams.com/", description: "Motorsports", category: "Live Sports" },
          { name: "NontonGP", url: "https://esp32.nontonx.com/", description: "Motorcycle Racing", category: "Live Sports" },
          { name: "r/rugbystreams", url: "https://www.reddit.com/r/rugbystreams/", description: "Rugby", category: "Live Sports" },
          { name: "Live Snooker Guide", url: "https://redd.it/1ibz2yz", description: "Snooker", category: "Live Sports" },
          { name: "Tiz-Cycling", url: "https://tiz-cycling.tv/", description: "Cycling", category: "Live Sports" },
          { name: "Formula Timer", url: "https://formula-timer.com/livetiming", description: "F1 Live Stats Dashboards", category: "Live Sports" },
          { name: "F1 Dash", url: "https://f1-dash.com/", description: "F1 Live Stats Dashboards", category: "Live Sports" },
          { name: "Futez", url: "https://www.futez.com.br/", description: "Rate / Review Football Matches", category: "Live Sports" },
        ]
      }
    ]
  }
];

export default function EverythingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState("anime");
  
  // --- FIX 1: Separate states for Bottom Navigation vs. Section Tabs ---
  // activeNav tracks the bottom navigation selection (String)
  const [activeNav, setActiveNav] = useState("everything");
  // activeSectionTabs tracks the active tab within each section (Object)
  const [activeSectionTabs, setActiveSectionTabs] = useState<{ [key: string]: string }>({});
  
  const [showBubble, setShowBubble] = useState<string | null>(null);

  // Initialize first tab for all sections on mount
  useEffect(() => {
    const initialTabs: { [key: string]: string } = {};
    sectionsData.forEach(section => {
      if (section.tabs.length > 0) {
        initialTabs[section.id] = section.tabs[0].id;
      }
    });
    setActiveSectionTabs(initialTabs);
  }, []);

  const currentSection = sectionsData.find((s: Section) => s.id === activeSection);
  
  // --- FIX 2: Use the correct object variable for tab lookup ---
  const currentTab = currentSection?.tabs.find((t: Tab) => t.id === activeSectionTabs[activeSection]);

  // Filter links based on search (and current tab)
  // --- FIX 3: Removed duplicate state declaration of filteredLinks ---
  const filteredLinks = useMemo(() => {
    return currentTab?.links || [];
  }, [currentTab]);

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTabChange = (section: Section, tabId: string) => {
    // --- FIX 4: Update the correct state and use correct types ---
    setActiveSectionTabs((prev: { [key: string]: string }) => {
      const newActive = { ...prev };
      newActive[section.id] = tabId;
      return newActive;
    });
  };

  const handleSectionChange = (sectionId: string) => {
    const section = sectionsData.find((s: Section) => s.id === sectionId);
    if (section) {
      setActiveSection(sectionId);
      const firstTab = section.tabs[0]?.id;
      if (firstTab) {
        // --- FIX 5: Update the correct state ---
        setActiveSectionTabs((prev: { [key: string]: string }) => ({ ...prev, [sectionId]: firstTab }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-pink-500/30">
      {/* ... */}
      <Toaster position="top-right" toastOptions={{ style: { background: "#111", color: "#fff", border: "1px solid rgba(236,72,153,0.2)" } }} />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/50 border-b border-pink-600/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div onClick={() => router.push("/")} className="flex items-center gap-2 cursor-pointer shrink-0">
            <img src="/ds-logo.png"
              alt="DS Entertainment Zone Logo" className="w-16 h-16 object-contain drop-shadow-lg" /> <p>d.s entertain ment zone</p>
            <span className="text-xl font-bold tracking-tight hidden sm:inline">
              DS <span className="text-pink-600">Entertainment Zone</span>
            </span>
          </div>
                  </div>
      </header>

      

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-pink-500 to-pink-900 mb-2">
            Everything Collection
          </h1>
          <p className="text-zinc-500 font-medium uppercase tracking-[0.2em]">
            Your Ultimate Entertainment Hub
          </p>
        </div>

        {/* Section Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {sectionsData.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`p-4 rounded-2xl border transition-all group ${
                  activeSection === section.id
                    ? "bg-pink-600/20 border-pink-600/50 text-pink-500"
                    : "bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">{section.name}</div>
              </button>
            );
          })}
        </div>

        {/* Current Section Content */}
        {currentSection && (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Section Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <currentSection.icon className="w-8 h-8 text-pink-500" />
                <h2 className="text-2xl font-bold text-pink-600">{currentSection.name}</h2>
              </div>
              <p className="text-zinc-400">{currentSection.description}</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
              {currentSection.tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(currentSection, tab.id)}
                  // --- FIX 6: Use correct variable for active check ---
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeSectionTabs[activeSection] === tab.id
                      ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20"
                      : "text-zinc-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            
            {/* Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="wait">
                {filteredLinks.map((link, index) => (
                  <motion.div
                    key={`${link.name}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => handleLinkClick(link.url)}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-pink-600/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-pink-500 transition-colors">
                          {link.name}
                        </h3>
                        {link.description && (
                          <p className="text-zinc-400 text-sm mb-2">{link.description}</p>
                        )}
                        {link.category && (
                          <span className="inline-block px-2 py-1 bg-pink-600/20 text-pink-500 text-xs rounded-full">
                            {link.category}
                          </span>
                        )}
                      </div>
                      <ExternalLink className="w-5 h-5 text-zinc-500 group-hover:text-pink-500 transition-colors shrink-0 ml-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-xs">Click to visit</span>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-pink-500 transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* No Results */}
            {filteredLinks.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                <p className="text-zinc-400">Try searching for something else</p>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Bottom Navigation */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-t border-pink-600/30 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            {[
              { id: "tamil-movies", icon: Film, label: "Tamil Movies", action: () => { router.push("/?site=moviesda"); setActiveNav("tamil-movies"); } },
              { id: "tamil-dubbed", icon: Mic, label: "Tamil Dubbed", action: () => { router.push("/?site=isaidub"); setActiveNav("tamil-dubbed"); } },
              { id: "anime-collection", icon: Tv, label: "Anime Collection", action: () => { router.push("/anime"); setActiveNav("anime-collection"); } },
              { id: "everything", icon: Globe, label: "Everything", action: () => { setActiveNav("everything"); } },
            ].map((item) => (
              <motion.div key={item.id} className="relative">
                <motion.button
                  whileHover={{ 
                    scale: 1.15, 
                    y: -5,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  whileTap={{ 
                    scale: 0.9,
                    transition: { type: "spring", stiffness: 600, damping: 15 }
                  }}
                  onClick={() => {
                    item.action();
                    setShowBubble(item.label);
                    setTimeout(() => setShowBubble(null), 2000);
                  }}
                  className={`p-4 rounded-2xl transition-all duration-300 relative backdrop-blur-sm ${
                    activeNav === item.id 
                      ? "bg-gradient-to-br from-pink-500 to-pink-700 text-white shadow-2xl shadow-pink-500/50 border border-pink-400/50" 
                      : "bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-pink-400 border border-white/10 hover:border-pink-500/30"
                  }`}
                >
                  <motion.div
                    animate={{ 
                      rotate: activeNav === item.id ? 360 : 0,
                      transition: { duration: 0.6, ease: "easeInOut" }
                    }}
                  >
                    <item.icon className="w-6 h-6" />
                  </motion.div>
                </motion.button>
                
                {/* Bubble Tooltip */}
                <AnimatePresence>
                  {showBubble === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.5 }}
                      animate={{ opacity: 1, y: -50, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-2xl backdrop-blur-md"
                      style={{ top: "-60px" }}
                    >
                      {item.label}
                      <motion.div 
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-pink-600 rotate-45 transform translate-y-1/2"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
