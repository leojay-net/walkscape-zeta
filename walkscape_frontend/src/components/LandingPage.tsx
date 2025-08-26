'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import ConnectButton from './ConnectButton';
import {
    Play,
    Zap,
    Users,
    Coins,
    Shield,
    Globe,
    Smartphone,
    Heart,
    Star,
    TreePine,
    MapPin,
    Trophy,
    ChevronRight,
    ExternalLink,
    Github,
    Twitter
} from 'lucide-react';

export default function LandingPage() {
    const { connect, isLoading } = useWallet();
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            icon: <MapPin className="w-8 h-8 text-green-400" />,
            title: "Explore & Discover",
            description: "Turn every walk into an adventure. Discover hidden artifacts and unlock new biomes as you explore the real world."
        },
        {
            icon: <TreePine className="w-8 h-8 text-green-300" />,
            title: "Collect Companions",
            description: "Find and nurture magical pets that accompany you on your journey. Each companion has unique abilities and traits."
        },
        {
            icon: <Users className="w-8 h-8 text-gray-300" />,
            title: "Build Communities",
            description: "Join or create colonies with other explorers. Share resources, plan expeditions, and grow together."
        },
        {
            icon: <Coins className="w-8 h-8 text-white" />,
            title: "Earn & Stake",
            description: "Stake your tokens for growth rewards. The more you walk and explore, the more you earn."
        }
    ];

    const stats = [
        { label: "Steps Tracked", value: "1M+", icon: <Zap className="w-5 h-5" /> },
        { label: "Artifacts Found", value: "15K+", icon: <Star className="w-5 h-5" /> },
        { label: "Active Explorers", value: "500+", icon: <Users className="w-5 h-5" /> },
        { label: "Colonies Formed", value: "50+", icon: <Shield className="w-5 h-5" /> }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <TreePine className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">WalkScape</span>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
                            <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How it Works</a>
                            <a href="#community" className="text-slate-300 hover:text-white transition-colors">Community</a>
                            <ConnectButton />
                        </div>

                        <div className="md:hidden">
                            <ConnectButton>Launch</ConnectButton>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-slate-950 to-slate-950"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                                <span className="block text-white">Explore.</span>
                                <span className="block text-green-400">Discover.</span>
                                <span className="block text-gray-300">Earn.</span>
                            </h1>

                            <p className="text-xl text-slate-300 mb-8 max-w-2xl">
                                The first social exploration game that turns your daily walks into epic adventures.
                                Built on ZetaChain, powered by your steps.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <ConnectButton className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4">
                                    <Play className="w-5 h-5" />
                                    Start Exploring
                                </ConnectButton>

                                <a
                                    href="#how-it-works"
                                    className="btn-secondary flex items-center justify-center gap-2 text-lg px-8 py-4"
                                >
                                    Learn More
                                    <ChevronRight className="w-5 h-5" />
                                </a>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-center lg:text-left">
                                        <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                                            {stat.icon}
                                            <span className="text-2xl font-bold text-white">{stat.value}</span>
                                        </div>
                                        <p className="text-sm text-slate-400">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero Visual */}
                        <div className="relative">
                            <div className="relative bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
                                <div className="bg-slate-900 rounded-2xl p-6 mb-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                            <MapPin className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Daily Quest</h3>
                                            <p className="text-sm text-slate-400">Discover Forest Biome</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-slate-300">Progress</span>
                                            <span className="text-sm text-green-400">75%</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                            <div className="bg-green-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900 rounded-xl p-4 text-center">
                                        <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                        <div className="text-lg font-bold">1,247</div>
                                        <div className="text-xs text-slate-400">XP Earned</div>
                                    </div>
                                    <div className="bg-slate-900 rounded-xl p-4 text-center">
                                        <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                        <div className="text-lg font-bold">3</div>
                                        <div className="text-xs text-slate-400">Pets Found</div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating elements */}
                            <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
                                <Star className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                                <Coins className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            Why Choose <span className="text-green-400">WalkScape</span>?
                        </h2>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                            Experience the perfect blend of fitness, gaming, and blockchain technology.
                            Every step you take has real value and purpose.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${activeFeature === index
                                        ? 'bg-slate-800 border-green-500 shadow-lg shadow-green-500/20'
                                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                        }`}
                                    onClick={() => setActiveFeature(index)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                            <p className="text-slate-300">{feature.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:pl-12">
                            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700">
                                <div className="aspect-square bg-slate-900 rounded-2xl flex items-center justify-center mb-6">
                                    <Smartphone className="w-24 h-24 text-slate-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Mobile-First Experience</h3>
                                <p className="text-slate-300 mb-6">
                                    Designed for modern explorers. Our mobile-optimized interface ensures
                                    seamless gameplay wherever your adventures take you.
                                </p>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        iOS Compatible
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        Android Ready
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            Start Your <span className="text-blue-400">Journey</span>
                        </h2>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                            Getting started is easy. Connect your wallet, create your explorer,
                            and begin your adventure in just three simple steps.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Connect Wallet",
                                description: "Link your ZetaChain wallet to securely store your progress, artifacts, and earnings.",
                                icon: <Shield className="w-12 h-12 text-green-400" />
                            },
                            {
                                step: "02",
                                title: "Create Explorer",
                                description: "Set up your unique explorer profile and choose your starting biome preference.",
                                icon: <Users className="w-12 h-12 text-blue-400" />
                            },
                            {
                                step: "03",
                                title: "Start Walking",
                                description: "Begin exploring! Every step counts towards discovering artifacts and earning XP.",
                                icon: <Globe className="w-12 h-12 text-purple-400" />
                            }
                        ].map((item, index) => (
                            <div key={index} className="text-center">
                                <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 hover:border-slate-600 transition-colors">
                                    <div className="text-6xl font-bold text-slate-700 mb-4">{item.step}</div>
                                    <div className="mb-6 flex justify-center">{item.icon}</div>
                                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                    <p className="text-slate-300">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Community Section */}
            <section id="community" className="py-24 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            Join the <span className="text-purple-400">Community</span>
                        </h2>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                            Connect with fellow explorers, share your discoveries, and shape the future of WalkScape.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Discord Community",
                                description: "Chat with explorers, get tips, and stay updated on new features.",
                                members: "500+ Members",
                                link: "#",
                                color: "text-purple-400"
                            },
                            {
                                title: "GitHub",
                                description: "Contribute to development, report bugs, and suggest improvements.",
                                members: "Open Source",
                                link: "#",
                                color: "text-blue-400"
                            },
                            {
                                title: "Twitter",
                                description: "Follow for updates, community highlights, and exciting announcements.",
                                members: "1K+ Followers",
                                link: "#",
                                color: "text-green-400"
                            }
                        ].map((community, index) => (
                            <div key={index} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
                                <h3 className="text-xl font-bold mb-3">{community.title}</h3>
                                <p className="text-slate-300 mb-4">{community.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm ${community.color}`}>{community.members}</span>
                                    <a
                                        href={community.link}
                                        className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
                                    >
                                        Join <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                        Ready to <span className="text-green-400">Explore</span>?
                    </h2>
                    <p className="text-xl text-slate-300 mb-8">
                        Your adventure awaits. Connect your wallet and start discovering the world around you.
                    </p>
                    <ConnectButton className="btn-primary text-lg px-12 py-4 mb-8">
                        Launch WalkScape
                    </ConnectButton>
                    <div className="text-sm text-slate-400">
                        Powered by ZetaChain • Built for Explorers
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-12 bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <TreePine className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">WalkScape</span>
                        </div>

                        <div className="flex items-center space-x-6">
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <span className="text-slate-400 text-sm">© 2025 WalkScape. All rights reserved.</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
