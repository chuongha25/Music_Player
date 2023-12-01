/*
    - Các bước cần thực hiện 
    1. Render songs
    2. Scroll top
    3. Play / pause / seek
    4. CD rotate
    5. Next / prev
    6. Random 
    7. Next / Repeat when ended
    8. Active song 
    9. Scroll active song into view
    10. Play song when click
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playList = $(".playlist");

const app = {
  songs: [
    {
      name: "Click Pow Get Down",
      singer: "Raftaar x Fortnite",
      path: "./asset/music/song1.mp3",
      image: "https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg",
    },
    {
      name: "Tu Phir Se Aana",
      singer: "Raftaar x Salim Merchant x Karma",
      path: "./asset/music/song1.mp3",
      image:
        "https://1.bp.blogspot.com/-kX21dGUuTdM/X85ij1SBeEI/AAAAAAAAKK4/feboCtDKkls19cZw3glZWRdJ6J8alCm-gCNcBGAsYHQ/s16000/Tu%2BAana%2BPhir%2BSe%2BRap%2BSong%2BLyrics%2BBy%2BRaftaar.jpg",
    },
    {
      name: "Naachne Ka Shaunq",
      singer: "Raftaar x Brobha V",
      path: "./asset/music/song1.mp3",
      image: "https://i.ytimg.com/vi/QvswgfLDuPg/maxresdefault.jpg",
    },
    {
      name: "Mantoiyat",
      singer: "Raftaar x Nawazuddin Siddiqui",
      path: "./asset/music/song1.mp3",
      image:
        "https://a10.gaanacdn.com/images/song/39/24225939/crop_480x480_1536749130.jpg",
    },
    {
      name: "Aage Chal",
      singer: "Raftaar",
      path: "./asset/music/song1.mp3",
      image:
        "https://a10.gaanacdn.com/images/albums/72/3019572/crop_480x480_3019572.jpg",
    },
    {
      name: "Damn",
      singer: "Raftaar x kr$na",
      path: "./asset/music/song1.mp3",
      image:
        "https://a10.gaanacdn.com/gn_img/albums/YoEWlabzXB/oEWlj5gYKz/size_xxl_1586752323.webp",
    },
    {
      name: "Feeling You",
      singer: "Raftaar x Harjas",
      path: "./asset/music/song1.mp3",
      image:
        "https://a10.gaanacdn.com/gn_img/albums/YoEWlabzXB/oEWlj5gYKz/size_xxl_1586752323.webp",
    },
  ],

  // Xử lý khi f5 lại trang cấu hình không thay đổi
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  // hàm render ra playList
  render: function () {
    var htmls = this.songs.map(function (song, index) {
      return `
                        <div class="song ${
                          index === app.currentIndex ? "active" : ""
                        }" data-index = "${index}">
                            <div class="thumb"
                                style="background-image: url('${song.image}')">
                            </div>
                            <div class="body">
                                <h3 class="title">${song.name}</h3>
                                <p class="author">${song.singer}</p>
                            </div>
                            <div class="option">
                                <i class="fas fa-ellipsis-h"></i>
                            </div>
                        </div>
                    `;
    });
    $(".playlist").innerHTML = htmls.join("");
  },

  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  // hàm xử lí sự kiện trong trang
  handleEvent: function () {
    const _this = this;
    const cd = $(".cd");
    const cdWidth = cd.offsetWidth;

    // xử lí phóng to thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newcdWidth = cdWidth - scrollTop;

      cd.style.width = newcdWidth > 0 ? newcdWidth + "px" : 0;
      cd.style.opacity = newcdWidth / cdWidth;
    };

    // xử lí khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        // _this.isPlaying = false;
        audio.pause();
        // player.classList.remove('playing');
      } else {
        // _this.isPlaying = true;
        audio.play();
        // player.classList.add('playing')
      }
    };

    // khi song được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };
    // khi song bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };
    // khi tiến độ bài hát thay đổi (curentTime: tgian hiện tại, duration: tổng thời lượng bài hát)
    audio.ontimeupdate = function () {
      if (audio.duration) {
        // tính phần trăm %
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };
    // xử lý khi tua song
    progress.onchange = function (e) {
      // tính số giây audio
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // xử lý CD quay / dừng
    const cdThumb = $(".cd-thumb");

    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 seconds
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // xử lý khi click next song
    nextBtn.onclick = function () {
      // Nếu mà bật random -> thì tiến hành random / ngược lại chưa bật -> thì next bài kế tiếp
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      // _this.nextSong();
      audio.play();
      _this.render(); // Render lại view khi ta next song -> thêm class active
      _this.scrollToActiveSong();
    };
    // xử lý khi click prev song
    prevBtn.onclick = function () {
      _this.prevSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // xử lý khi click bật / tắt random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      randomBtn.classList.toggle("active", _this.isRandom); // (nếu boolean là true thì sẽ add class / là false thì sẽ remove class)
      // lưu lại cấu hình khi f5
      _this.setConfig("isRandom", _this.isRandom);
    };

    // xử lý next song khi audio ended
    audio.onended = function () {
      // nếu mà repeat -> thì lặp lại bài hát / ngược lại không repeat -> thì next bài kế tiếp
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
      // nextBtn.click();
    };

    // xử lý lặp lại song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      repeatBtn.classList.toggle("active", _this.isRepeat);
      // lưu lại cấu hình khi f5
      _this.setConfig("isRepeat", _this.isRepeat);
    };

    // xử lý lắng nghe hành vi khi click vào playlist
    playList.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      // Nếu không phải là active hoặc nó là option thì cho nó vào
      if (songNode || e.target.closest(".option")) {
        // console.log(e.target)

        // xử lý khi click vào song
        if (songNode) {
          // console.log(songNode.getAttribute('data-index'));
          _this.currentIndex = Number(songNode.getAttribute("data-index"));
          _this.loadCurrentSong();
          audio.play();
          _this.render();
        }
        // xử lý khi click vào option
        if (e.target.closest(".option")) {
        }
      }
    };
  },

  currentIndex: 0,
  // hàm lấy ra bài hát đầu tiên
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  // hàm để load ra bài hát hiện tại
  loadCurrentSong: function () {
    const heading = $("header h2");
    const cdThumb = $(".cd-thumb");
    const audio = $("#audio");

    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
    // console.log(heading, cdThumb, audio);
  },

  // hàm để next sang bài hát tiếp theo
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  // hàm để lùi bài hát hiện lại
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  // hàm để random bài hát (trừ bài hát hiện tại)
  playRandomSong: function () {
    // dùng do while sẽ ít nhất chạy 1 lần
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    // console.log(newIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  // hàm xử lí khi scroll khuất màn hình
  scrollToActiveSong: function (song) {
    setTimeout(function () {
      $(".song .active").scrollIntoView({
        behavior: "smooth",
        block: "mearest",
      });
    }, 500);
  },

  // Hàm load ra config
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  start: function () {
    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    // Định nghĩa các thuộc tính cho object
    this.defineProperties();

    // Lắng nghe / xử lí các sự kiện (Dom Events)
    this.handleEvent();

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    // Render playList
    this.render();

    // Hiển thị trang thái ban đầu của button repeat & random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();
