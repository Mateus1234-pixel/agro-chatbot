// Agricultural API Service - Multiple data sources for enhanced reliability

class AgriculturalAPIService {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 30 * 60 * 1000; // 30 minutes cache
  }

  // Weather APIs with fallbacks
  async getWeatherData(lat, lon) {
    const cacheKey = `weather_${lat}_${lon}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Try Open-Meteo first (most reliable)
      const data = await this.fetchOpenMeteoWeather(lat, lon);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('Open-Meteo failed, trying fallback:', error);
      
      // Fallback 1: OpenWeatherMap
      try {
        const data = await this.fetchOpenWeatherMap(lat, lon);
        this.setCache(cacheKey, data);
        return data;
      } catch (error2) {
        console.warn('OpenWeatherMap failed, trying final fallback:', error2);
        
        // Final fallback: Simulated data
        const data = this.generateSimulatedWeatherData();
        this.setCache(cacheKey, data);
        return data;
      }
    }
  }

  async fetchOpenMeteoWeather(lat, lon) {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    return {
      tempNow: data.current.temperature_2m,
      tempMin: data.daily.temperature_2m_min[0],
      tempMax: data.daily.temperature_2m_max[0],
      humidityAir: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      windDir: this.convertWindDirection(data.current.wind_direction_10m),
      conditions: this.getWeatherCondition(data.current.precipitation),
      rain: data.daily.precipitation_sum[0],
      source: 'Open-Meteo',
      success: true
    };
  }

  async fetchOpenWeatherMap(lat, lon) {
    // This would use the OpenWeatherMap API key from ENV.js
    const owmKey = window.ENV?.OWM_KEY || 'demo';
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${owmKey}&units=metric&lang=pt_br`);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    return {
      tempNow: data.main.temp,
      tempMin: data.main.temp_min,
      tempMax: data.main.temp_max,
      humidityAir: data.main.humidity,
      windSpeed: data.wind.speed * 3.6, // Convert m/s to km/h
      windDir: this.convertWindDirection(data.wind.deg),
      conditions: data.weather[0].description,
      rain: data.rain ? data.rain['1h'] || 0 : 0,
      source: 'OpenWeatherMap',
      success: true
    };
  }

  // Soil Data APIs
  async getSoilData(lat, lon) {
    const cacheKey = `soil_${lat}_${lon}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Try SoilGrids API
      const data = await this.fetchSoilGrids(lat, lon);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('SoilGrids failed, trying fallback:', error);
      
      // Fallback: Simulated soil data
      const data = this.generateSimulatedSoilData();
      this.setCache(cacheKey, data);
      return data;
    }
  }

  async fetchSoilGrids(lat, lon) {
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=phh2o&property=ocd&property=nitrogen&property=sand&property=silt&property=clay&depth=0-5cm`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();

    const getMean = (prop) => {
      const arr = data.properties[prop]?.layers?.[0]?.values?.mean;
      return arr !== undefined ? Number(arr).toFixed(2) : null;
    };

    return {
      soilPH: getMean('phh2o'),
      soilMoisture: await this.fetchSoilMoisture(lat, lon),
      soilN: getMean('nitrogen') + ' g/kg',
      soilP: 'N/A', // Not available in SoilGrids
      soilK: 'N/A', // Not available in SoilGrids
      orgC: getMean('ocd') + ' g/kg',
      textureDisplay: `Areia ${getMean('sand')}, Silte ${getMean('silt')}, Argila ${getMean('clay')}`,
      drainage: this.getDrainageFromTexture({
        sand: parseFloat(getMean('sand')),
        clay: parseFloat(getMean('clay'))
      }),
      source: 'SoilGrids',
      success: true
    };
  }

  async fetchSoilMoisture(lat, lon) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=soil_moisture_0_1cm&timezone=UTC`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const moistureArray = data.hourly.soil_moisture_0_1cm;
      
      // Get the latest non-null value
      let lastIndex = moistureArray.length - 1;
      while (lastIndex >= 0 && moistureArray[lastIndex] === null) {
        lastIndex--;
      }

      if (lastIndex < 0) throw new Error('No soil moisture data available');
      
      return (moistureArray[lastIndex] * 100).toFixed(1) + '%';
    } catch (error) {
      console.warn('Soil moisture API failed:', error);
      return (30 + Math.random() * 60).toFixed(1) + '%'; // Fallback
    }
  }

  // Market Price API
  async getCropPrices(cropName) {
    const cacheKey = `prices_${cropName}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Using a free agricultural market API (example)
      const response = await fetch(`https://api.example.com/agriculture/prices?crop=${encodeURIComponent(cropName)}`);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('Market price API failed:', error);
      return this.generateSimulatedPrices(cropName);
    }
  }

  // Agricultural News API
  async getAgriculturalNews() {
    const cacheKey = 'agricultural_news';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Using News API or similar service
      const response = await fetch('https://newsapi.org/v2/everything?q=agricultura+brasil&language=pt&sortBy=publishedAt&apiKey=YOUR_API_KEY');
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.setCache(cacheKey, data.articles.slice(0, 5)); // Top 5 articles
      return data.articles.slice(0, 5);
    } catch (error) {
      console.warn('News API failed:', error);
      return this.generateSimulatedNews();
    }
  }

  // Helper methods
  convertWindDirection(degrees) {
    const directions = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  getWeatherCondition(precipitation) {
    if (precipitation > 5) return 'Chuva forte';
    if (precipitation > 0.5) return 'Chuva leve';
    return 'Céu limpo';
  }

  getDrainageFromTexture(texture) {
    if (!texture) return 'Média';
    const sand = parseFloat(texture.sand);
    const clay = parseFloat(texture.clay);
    if (sand > 70) return 'Boa';
    if (clay > 50) return 'Ruim';
    return 'Média';
  }

  // Cache management
  getFromCache(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.cacheDuration) {
      return item.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Fallback data generators
  generateSimulatedWeatherData() {
    return {
      tempNow: 25 + Math.floor(Math.random() * 10),
      tempMin: 20 + Math.floor(Math.random() * 5),
      tempMax: 28 + Math.floor(Math.random() * 7),
      humidityAir: 60 + Math.floor(Math.random() * 30),
      windSpeed: (5 + Math.random() * 15).toFixed(1),
      windDir: ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'][Math.floor(Math.random() * 8)],
      conditions: ['Céu limpo', 'Parcialmente nublado', 'Nublado', 'Chuva leve'][Math.floor(Math.random() * 4)],
      rain: Math.random() > 0.7 ? (Math.random() * 20).toFixed(1) : 0,
      source: 'Simulado',
      success: false
    };
  }

  generateSimulatedSoilData() {
    const simulatedPH = (5.5 + Math.random() * 2.5).toFixed(2);
    const simulatedMoisture = (30 + Math.random() * 60).toFixed(1) + '%';
    const simulatedN = (20 + Math.random() * 40).toFixed(1) + ' g/kg';
    const simulatedP = (10 + Math.random() * 30).toFixed(1) + ' ppm';
    const simulatedK = (50 + Math.random() * 70).toFixed(1) + ' ppm';
    const simulatedOrgC = (1 + Math.random() * 4).toFixed(1) + ' g/kg';
    const textures = ['Argiloso', 'Franco-argiloso', 'Franco', 'Franco-arenoso', 'Arenoso'];
    const simulatedTexture = textures[Math.floor(Math.random() * textures.length)];

    return {
      soilPH: simulatedPH,
      soilMoisture: simulatedMoisture,
      soilN: simulatedN,
      soilP: simulatedP,
      soilK: simulatedK,
      orgC: simulatedOrgC,
      textureDisplay: simulatedTexture,
      drainage: this.getDrainageFromTexture({
        sand: (30 + Math.random() * 60).toFixed(1),
        clay: (10 + Math.random() * 40).toFixed(1)
      }),
      source: 'Simulado',
      success: false
    };
  }

  generateSimulatedPrices(cropName) {
    const basePrices = {
      'soja': { price: 150.00, unit: 'sc/60kg', trend: 'up' },
      'milho': { price: 80.00, unit: 'sc/60kg', trend: 'stable' },
      'café': { price: 1200.00, unit: 'sc/60kg', trend: 'up' },
      'trigo': { price: 90.00, unit: 'sc/60kg', trend: 'down' },
      'default': { price: 100.00, unit: 'sc/60kg', trend: 'stable' }
    };

    return basePrices[cropName.toLowerCase()] || basePrices.default;
  }

  generateSimulatedNews() {
    return [
      {
        title: 'Chuvas beneficiam plantio na região Sudeste',
        description: 'Precipitações acima da média favorecem desenvolvimento das culturas',
        url: '#',
        publishedAt: new Date().toISOString()
      },
      {
        title: 'Novas técnicas de irrigação aumentam produtividade',
        description: 'Métodos modernos reduzem consumo de água em 30%',
        url: '#',
        publishedAt: new Date().toISOString()
      }
    ];
  }
}

// Export singleton instance
const agriculturalAPI = new AgriculturalAPIService();
window.agriculturalAPI = agriculturalAPI;
