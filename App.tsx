import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Home, Info, Phone, ShoppingBag, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function App() {
  const [breeds, setBreeds] = useState([
    {
      id: "lop",
      name: "垂耳兔 (Lop Rabbit)",
      description: "性格温顺，耳朵自然下垂，非常受小朋友欢迎。",
      image: "https://img.alicdn.com/bao/uploaded/i3/2877079094/O1CN01pSwz1M2H36ecetYCJ_!!2877079094.jpg",
      price: "¥299 起",
      isGenerating: false
    },
    {
      id: "dwarf",
      name: "侏儒兔 (Netherland Dwarf)",
      description: "体型娇小，活泼好动，是公寓饲养的首选。",
      image: "https://tse4.mm.bing.net/th/id/OIP.zBkxrw5iMbtohPbuIuNDIQHaFq?rs=1&pid=ImgDetMain&o=7&rm=3",
      price: "¥399 起",
      isGenerating: false
    },
    {
      id: "angora",
      name: "安哥拉兔 (Angora Rabbit)",
      description: "毛发蓬松柔软，像个大棉花糖，需要定期打理。",
      image: "https://th.bing.com/th/id/OIP.KfIqgWl4n1Q307FtREXHYAHaHi?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
      price: "¥499 起",
      isGenerating: false
    },
    {
      id: "lionhead",
      name: "狮子头兔 (Lionhead Rabbit)",
      description: "颈部有一圈像狮子一样的鬃毛，外观独特霸气。",
      image: "https://th.bing.com/th/id/OIP.-Z6ILrYoxts8OGJ7lrdvPQHaFe?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
      price: "¥350 起",
      isGenerating: false
    }
  ]);

  const [environments, setEnvironments] = useState([
    {
      id: "env1",
      title: "恒温兔舍",
      description: "全天候自动控温系统，确保兔兔在最舒适的环境下成长。",
      image: "https://picsum.photos/seed/env1/800/600",
      isGenerating: false
    },
    {
      id: "env2",
      title: "无尘草料间",
      description: "精选进口提摩西草，严格防潮处理，保证饮食健康。",
      image: "https://picsum.photos/seed/env2/800/600",
      isGenerating: false
    },
    {
      id: "env3",
      title: "每日放风区",
      description: "宽敞的室内活动空间，让兔兔保持充足的运动量。",
      image: "https://picsum.photos/seed/env3/800/600",
      isGenerating: false
    }
  ]);

  const generateImage = async (type: 'breed' | 'env', id: string, prompt: string) => {
    // Update loading state
    if (type === 'breed') {
      setBreeds(prev => prev.map(b => b.id === id ? { ...b, isGenerating: true } : b));
    } else {
      setEnvironments(prev => prev.map(e => e.id === id ? { ...e, isGenerating: true } : e));
    }

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [{ parts: [{ text: `A high quality, professional photography of ${prompt}. Soft lighting, cute aesthetic, pastel colors, pet store style.` }] }],
        config: { imageConfig: { aspectRatio: "4:3" } }
      });

      let imageUrl = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        if (type === 'breed') {
          setBreeds(prev => prev.map(b => b.id === id ? { ...b, image: imageUrl, isGenerating: false } : b));
        } else {
          setEnvironments(prev => prev.map(e => e.id === id ? { ...e, image: imageUrl, isGenerating: false } : e));
        }
      }
    } catch (error: any) {
      console.error("Image generation failed:", error);
      
      let errorMessage = "AI 生成图片失败，请稍后再试。";
      
      // Check for quota exhaustion (429)
      if (error?.message?.includes("429") || error?.status === 429 || JSON.stringify(error).includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "由于当前 AI 生成请求过多（配额已耗尽），请稍等几分钟再试，或手动更换图片链接。";
      }
      
      alert(errorMessage);
      
      if (type === 'breed') {
        setBreeds(prev => prev.map(b => b.id === id ? { ...b, isGenerating: false } : b));
      } else {
        setEnvironments(prev => prev.map(e => e.id === id ? { ...e, isGenerating: false } : e));
      }
    }
  };

  return (
    <div className="min-h-screen rabbit-pattern font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-pink-primary rounded-full flex items-center justify-center text-white">
                <Heart size={24} fill="currentColor" />
              </div>
              <span className="text-2xl font-bold text-pink-dark font-display">小耳朵兔舍</span>
            </div>
            <div className="hidden md:flex space-x-8 text-pink-dark font-medium">
              <a href="#home" className="hover:text-pink-primary transition-colors">首页</a>
              <a href="#breeds" className="hover:text-pink-primary transition-colors">品种介绍</a>
              <a href="#env" className="hover:text-pink-primary transition-colors">兔舍环境</a>
              <a href="#contact" className="hover:text-pink-primary transition-colors">联系我们</a>
            </div>
            <button className="bg-pink-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-dark transition-all shadow-md">
              立即预约
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 text-center md:text-left z-10"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-pink-dark mb-6 leading-tight font-display">
              遇见你的<br />
              <span className="text-pink-primary">软萌小天使</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              我们致力于繁育健康、亲人的宠物兔。每一只兔兔都经过专业体检，为您开启温馨的养宠生活。
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button className="bg-pink-dark text-white px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-lg flex items-center gap-2">
                <ShoppingBag size={20} /> 查看在售兔兔
              </button>
              <button className="bg-white text-pink-dark border-2 border-pink-dark px-8 py-4 rounded-full text-lg font-bold hover:bg-pink-50 transition-colors shadow-lg">
                了解养护知识
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="md:w-1/2 mt-12 md:mt-0 relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://picsum.photos/seed/cute-rabbit/800/800" 
                alt="Cute Rabbit" 
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-200 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-pink-300 rounded-full blur-3xl opacity-40"></div>
          </motion.div>
        </div>
      </section>

      {/* Breeds Section */}
      <section id="breeds" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold text-pink-dark mb-4 font-display">人气品种</h2>
            <div className="w-24 h-1 bg-pink-primary mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              从娇小可爱的侏儒兔到温顺亲人的垂耳兔，总有一款能俘获你的心。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {breeds.map((breed, index) => (
              <motion.div
                key={breed.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-pink-50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="relative h-64 overflow-hidden bg-pink-100">
                  <AnimatePresence mode="wait">
                    {breed.isGenerating ? (
                      <motion.div 
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-pink-100/80 z-20"
                      >
                        <Loader2 className="animate-spin text-pink-dark mb-2" size={32} />
                        <span className="text-pink-dark font-bold text-sm">AI 正在绘制...</span>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                  
                  <img 
                    src={breed.image} 
                    alt={breed.name} 
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${breed.isGenerating ? 'blur-sm' : ''}`}
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-pink-dark font-bold text-sm z-10">
                    {breed.price}
                  </div>

                  {/* AI Regenerate Button */}
                  <button 
                    onClick={() => generateImage('breed', breed.id, `a cute ${breed.name} pet rabbit`)}
                    disabled={breed.isGenerating}
                    className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full text-pink-dark hover:bg-pink-primary hover:text-white transition-all shadow-md z-10 group/btn"
                    title="使用 AI 重新生成插图"
                  >
                    <RefreshCw size={18} className={`${breed.isGenerating ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform duration-500'}`} />
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-pink-dark mb-2">{breed.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {breed.description}
                  </p>
                  <button className="mt-4 w-full py-2 rounded-xl border border-pink-200 text-pink-dark font-semibold hover:bg-pink-primary hover:text-white transition-colors">
                    查看详情
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Environment Section */}
      <section id="env" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-2 text-pink-dark mb-4">
                  <Sparkles size={24} />
                  <span className="font-bold uppercase tracking-widest text-sm">Our Facility</span>
                </div>
                <h2 className="text-4xl font-bold text-pink-dark mb-6 font-display">五星级兔舍环境</h2>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  我们深知环境对兔兔健康的重要性。在这里，每一只兔兔都享有独立的生活空间，科学的膳食搭配，以及充满爱心的日常互动。
                </p>
                <ul className="space-y-4">
                  {[
                    "每日两次全面消毒，确保环境卫生",
                    "专业营养师配比科学兔粮与干草",
                    "24小时监控，随时关注兔兔动态",
                    "定期邀请宠物医生进行健康检查"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <div className="w-6 h-6 bg-pink-primary rounded-full flex items-center justify-center text-white shrink-0">
                        <Heart size={14} fill="currentColor" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              {environments.map((env, i) => (
                <motion.div
                  key={env.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className={`relative rounded-2xl overflow-hidden shadow-lg group ${i === 0 ? 'col-span-2 h-64' : 'h-48'}`}
                >
                  {env.isGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-100/80 z-20">
                      <Loader2 className="animate-spin text-pink-dark mb-2" size={32} />
                      <span className="text-pink-dark font-bold text-xs">AI 生成中...</span>
                    </div>
                  )}
                  <img 
                    src={env.image} 
                    alt={env.title} 
                    className={`w-full h-full object-cover transition-all duration-500 ${env.isGenerating ? 'blur-sm' : 'group-hover:scale-105'}`}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-white font-bold text-xl">{env.title}</h4>
                        <p className="text-white/80 text-sm line-clamp-1">{env.description}</p>
                      </div>
                      <button 
                        onClick={() => generateImage('env', env.id, `a professional clean indoor ${env.title} for pet rabbits`)}
                        disabled={env.isGenerating}
                        className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all"
                        title="重新生成环境图"
                      >
                        <RefreshCw size={16} className={env.isGenerating ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-pink-primary">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold mb-6">准备好带它回家了吗？</h2>
            <p className="text-xl mb-10 opacity-90">
              关注我们的微信公众号，获取最新在售兔兔动态及养兔指南。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white p-4 rounded-2xl shadow-xl inline-block mx-auto sm:mx-0">
                <img src="https://picsum.photos/seed/qr/150/150" alt="QR Code" className="w-32 h-32" referrerPolicy="no-referrer" />
                <p className="text-pink-dark text-xs mt-2 font-bold">扫码关注公众号</p>
              </div>
              <div className="flex flex-col justify-center gap-4">
                <button className="bg-white text-pink-dark px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-50 transition-colors shadow-lg">
                  联系客服咨询
                </button>
                <div className="flex items-center justify-center gap-2 text-white font-medium">
                  <Phone size={20} /> 010-8888-9999
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-white py-12 border-t border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-pink-primary rounded-full flex items-center justify-center text-white">
                  <Heart size={18} fill="currentColor" />
                </div>
                <span className="text-xl font-bold text-pink-dark font-display">小耳朵兔舍</span>
              </div>
              <p className="text-gray-500 max-w-sm mb-6">
                致力于为每一只兔兔寻找温暖的家，为每一位主人提供最专业的养宠支持。
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">快速链接</h4>
              <ul className="space-y-4 text-gray-500">
                <li><a href="#" className="hover:text-pink-dark transition-colors">在售兔兔</a></li>
                <li><a href="#" className="hover:text-pink-dark transition-colors">兔舍环境</a></li>
                <li><a href="#" className="hover:text-pink-dark transition-colors">养护知识</a></li>
                <li><a href="#" className="hover:text-pink-dark transition-colors">关于我们</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">联系我们</h4>
              <ul className="space-y-4 text-gray-500">
                <li className="flex items-start gap-3">
                  <Home size={20} className="shrink-0 text-pink-primary" />
                  <span>北京市朝阳区萌宠大道88号小耳朵兔舍旗舰店</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={20} className="shrink-0 text-pink-primary" />
                  <span>010-8888-9999</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-pink-50 text-center text-gray-400 text-sm">
            &copy; 2026 小耳朵兔舍宠物兔专卖店. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
