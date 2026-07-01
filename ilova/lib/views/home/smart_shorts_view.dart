import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import '../../core/theme.dart';
import '../../controllers/age_tier_controller.dart';

class SmartShortsView extends StatefulWidget {
  const SmartShortsView({super.key});

  @override
  State<SmartShortsView> createState() => _SmartShortsViewState();
}

class _SmartShortsViewState extends State<SmartShortsView> with SingleTickerProviderStateMixin {
  final PageController _pageController = PageController();
  final String googleYoutubeApiKey = "AIzaSyDexlIfNu9reBQbnzXi0v0vbY3HeWkE9zk";

  // Uzbek Safe-Content Publishers Channel IDs
  final List<Map<String, String>> _uzbekChannels = [
    {"name": "Lola va uning do'stlari", "id": "UCJz4gAolU3wYp5J4YtF0qJw"},
    {"name": "Dono Momo", "id": "UCz4G-x_t_C2C7rw_Btw2xtw"},
    {"name": "Bek Kids", "id": "UCq_wK1_C-x_5Yc2C7r2x2tw"},
  ];

  // Pre-cached local fallback list of YouTube video IDs
  final List<String> _fallbackShortsIds = [
    "1GZp_5tQfJ0",
    "Jv5R3zJtLnk",
    "Wn-bQJgB-X8",
    "qWn-rD713Zc",
    "P0jT9mIe3C0",
  ];

  List<String> _videoIds = [];
  final Map<int, YoutubePlayerController> _controllers = {};
  int _currentPageIndex = 0;
  bool _isLoading = true;
  bool _showRewardOverlay = false;

  // Reward overlay particle offset tracking
  final List<Offset> _rewardParticles = [];
  late final AnimationController _rewardParticleController;

  @override
  void initState() {
    super.initState();
    _rewardParticleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _fetchUzbekChildShorts();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _rewardParticleController.dispose();
    _controllers.forEach((key, controller) {
      controller.close();
    });
    super.dispose();
  }

  Future<void> _fetchUzbekChildShorts() async {
    List<String> fetchedIds = [];
    try {
      for (final channel in _uzbekChannels) {
        final String channelId = channel["id"]!;
        final url = Uri.parse(
          "https://www.googleapis.com/youtube/v3/search"
          "?part=snippet"
          "&channelId=$channelId"
          "&type=video"
          "&videoDuration=short"
          "&q=shorts"
          "&maxResults=3"
          "&key=$googleYoutubeApiKey"
        );

        final response = await http.get(url);
        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          if (data["items"] != null) {
            for (final item in data["items"]) {
              final videoId = item["id"]?["videoId"];
              if (videoId != null && !fetchedIds.contains(videoId)) {
                fetchedIds.add(videoId);
              }
            }
          }
        }
      }
    } catch (_) {
      // In case of quota throttling, offline status, or endpoint failures
    }

    if (mounted) {
      setState(() {
        if (fetchedIds.isEmpty) {
          _videoIds = List.from(_fallbackShortsIds);
        } else {
          _videoIds = fetchedIds;
        }
        _isLoading = false;
      });
    }
  }

  void _triggerCompletionReward(int pageIndex) {
    if (!mounted) return;
    setState(() {
      _showRewardOverlay = true;
      _rewardParticles.clear();
      for (int i = 0; i < 30; i++) {
        final double angle = math.Random().nextDouble() * math.pi * 2;
        final double dist = 40 + math.Random().nextDouble() * 120;
        _rewardParticles.add(Offset(math.cos(angle) * dist, math.sin(angle) * dist));
      }
    });

    _rewardParticleController.forward(from: 0.0);

    // Sync stars and progress
    final ageController = Provider.of<AgeTierController>(context, listen: false);
    ageController.syncStarsToCloud(100);
    ageController.advanceNode();

    // Auto scroll next page after 1.5 seconds reward display
    Future.delayed(const Duration(milliseconds: 1600), () {
      if (mounted) {
        setState(() {
          _showRewardOverlay = false;
        });
        if (pageIndex < _videoIds.length - 1) {
          _pageController.nextPage(
            duration: const Duration(milliseconds: 600),
            curve: Curves.easeInOutBack,
          );
        }
      }
    });
  }

  YoutubePlayerController _getControllerForIndex(int idx) {
    if (_controllers.containsKey(idx)) {
      return _controllers[idx]!;
    }

    final controller = YoutubePlayerController.fromVideoId(
      videoId: _videoIds[idx],
      autoPlay: idx == _currentPageIndex,
      params: const YoutubePlayerParams(
        showControls: false,
        showFullscreenButton: false,
        mute: false,
        loop: false,
      ),
    );

    controller.listen((state) {
      if (state.playerState == PlayerState.ended) {
        controller.pauseVideo(); // Pause to prevent duplicate end events
        _triggerCompletionReward(idx);
      }
    });

    _controllers[idx] = controller;
    return controller;
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentPageIndex = index;
    });

    // Control play states of individual player slots to avoid overlap sounds
    _controllers.forEach((key, controller) {
      if (key == index) {
        controller.playVideo();
      } else {
        controller.pauseVideo();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final ageController = Provider.of<AgeTierController>(context);
    final bool isPreLiterate = !ageController.canReadWrite;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 24),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: isPreLiterate
            ? const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.video_library_rounded, color: Colors.white, size: 28),
                  SizedBox(width: 8),
                  Icon(Icons.star_rounded, color: Colors.amber, size: 28),
                ],
              )
            : Text(
                "Tarbiyaviy Shorts",
                style: AppTheme.headerMedium.copyWith(color: Colors.white),
              ),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: Colors.amber,
              ),
            )
          : Stack(
              children: [
                PageView.builder(
                  scrollDirection: Axis.vertical,
                  controller: _pageController,
                  onPageChanged: _onPageChanged,
                  itemCount: _videoIds.length,
                  itemBuilder: (context, idx) {
                    final YoutubePlayerController playerController = _getControllerForIndex(idx);

                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(36),
                        border: Border.all(color: Colors.amber.withValues(alpha: 0.4), width: 3),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.amber.withValues(alpha: 0.2),
                            blurRadius: 16,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(32),
                        child: AspectRatio(
                          aspectRatio: 9 / 16,
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              YoutubePlayer(
                                controller: playerController,
                              ),
                              // Prevent touches from interfering with controls
                              Positioned.fill(
                                child: YoutubeValueBuilder(
                                  controller: playerController,
                                  builder: (context, value) {
                                    return GestureDetector(
                                      onTap: () {
                                        if (value.playerState == PlayerState.playing) {
                                          playerController.pauseVideo();
                                        } else {
                                          playerController.playVideo();
                                        }
                                      },
                                      child: Container(
                                        color: Colors.transparent,
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),

                // Star Burst Completion Overlay
                if (_showRewardOverlay)
                  Positioned.fill(
                    child: Container(
                      color: Colors.black54,
                      child: AnimatedBuilder(
                        animation: _rewardParticleController,
                        builder: (context, child) {
                          final double val = _rewardParticleController.value;
                          return Center(
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                // Center Pulsing Star
                                Transform.scale(
                                  scale: 1.0 + math.sin(val * math.pi * 2.0) * 0.2,
                                  child: Container(
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.amber.withValues(alpha: 0.6),
                                          blurRadius: 40 * val,
                                          spreadRadius: 10 * val,
                                        ),
                                      ],
                                    ),
                                    child: const Icon(
                                      Icons.star_rounded,
                                      color: Colors.amber,
                                      size: 130,
                                    ),
                                  ),
                                ),
                                // Flying Mini Stars
                                ...List.generate(_rewardParticles.length, (i) {
                                  final p = _rewardParticles[i];
                                  final dx = p.dx * val;
                                  final dy = p.dy * val;
                                  final opacity = (1.0 - val).clamp(0.0, 1.0);
                                  return Transform.translate(
                                    offset: Offset(dx, dy),
                                    child: Opacity(
                                      opacity: opacity,
                                      child: const Icon(
                                        Icons.star_purple500_sharp,
                                        color: Colors.amberAccent,
                                        size: 24,
                                      ),
                                    ),
                                  );
                                }),
                                // Success Text (Hidden for pre-literate)
                                Positioned(
                                  bottom: 120,
                                  child: Opacity(
                                    opacity: (1.0 - (1.0 - val) * (1.0 - val)).clamp(0.0, 1.0),
                                    child: Text(
                                      isPreLiterate ? "⭐ +100 ⭐" : "Ajoyib! +100 ball!",
                                      style: AppTheme.headerMedium.copyWith(
                                        color: Colors.white,
                                        fontSize: 26,
                                        shadows: [
                                          const Shadow(
                                            color: Colors.black87,
                                            offset: Offset(2, 2),
                                            blurRadius: 4,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ),
              ],
            ),
    );
  }
}
