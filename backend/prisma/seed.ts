import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpando itens e pedidos antigos...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  console.log('👤 Criando ou atualizando usuários padrão (Admin e Cliente)...');
  const adminPasswordHash = await bcrypt.hash('admin123', 8);
  const clientePasswordHash = await bcrypt.hash('cliente123', 8);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vortexgear.com' },
    update: {
      name: 'Admin Vortex',
      role: 'ADMIN',
      passwordHash: adminPasswordHash,
    },
    create: {
      name: 'Admin Vortex',
      email: 'admin@vortexgear.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    },
  });

  const cliente = await prisma.user.upsert({
    where: { email: 'cliente@vortexgear.com' },
    update: {
      name: 'Player One',
      role: 'CUSTOMER',
      passwordHash: clientePasswordHash,
    },
    create: {
      name: 'Player One',
      email: 'cliente@vortexgear.com',
      passwordHash: clientePasswordHash,
      role: 'CUSTOMER',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    },
  });

  console.log(`✅ Usuários criados: ${admin.email} (ADMIN), ${cliente.email} (CUSTOMER)`);

  console.log('📂 Verificando categorias gamer...');
  const categoriesData = [
    { name: 'Mouses', slug: 'mouses' },
    { name: 'Teclados', slug: 'teclados' },
    { name: 'Monitores', slug: 'monitores' },
    { name: 'Áudio', slug: 'audio' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
    categories[cat.slug] = category;
  }

  console.log('🎮 Cadastrando ou atualizando catálogo de periféricos Vortex Gear...');

  const products = [
    {
      name: 'Mouse Gamer Vortex Phantom Pro Wireless 8000Hz (39g)',
      slug: 'mouse-vortex-phantom-pro-wireless-8000hz',
      description:
        'Mouse competitivo ultraleve com chassi em liga de magnésio/fibra de carbono, sensor óptico PAW3950 de 30.000 DPI e dongle receptor 8K nativo com latência de clique de 0.125ms.',
      price: 899.9,
      discountPrice: 799.9,
      stock: 18,
      imageUrl:
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80',
      specs: JSON.stringify({
        Sensor: 'PixArt PAW3950 Custom',
        DPI: '30.000 DPI',
        PollingRate: '8000Hz Wireless (0.125ms)',
        Peso: '39g (Sem Furos)',
        Switch: 'Omron Optical 100M',
        Conexao: '2.4GHz HyperSpeed / USB-C Paracord',
      }),
      featured: true,
      categoryId: categories['mouses'].id,
    },
    {
      name: 'Mouse Gamer Vortex Viper Zero Carbon 8K',
      slug: 'mouse-vortex-viper-zero-carbon-8k',
      description:
        'Desenhado para pegadas Claw e Fingertip com revestimento Ice-Grip antiderrapante, skates 100% PTFE virgem e bateria de longa duração para maratonas de e-sports.',
      price: 749.9,
      discountPrice: null,
      stock: 25,
      imageUrl:
        'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1000&q=80',
      specs: JSON.stringify({
        Sensor: 'PixArt PAW3395 Pro',
        DPI: '26.000 DPI',
        PollingRate: '8000Hz (Dongle Incluso)',
        Peso: '44g',
        Switch: 'Huano Blue Shell Pink Dot Transparent',
        Bateria: 'Até 90 horas (1000Hz)',
      }),
      featured: false,
      categoryId: categories['mouses'].id,
    },
    {
      name: 'Teclado Mecânico Magnético Vortex Apex HE Rapid Trigger 60%',
      slug: 'teclado-magnetico-vortex-apex-he-rapid-trigger-60',
      description:
        'Switches magnéticos Hall Effect de segunda geração com ponto de atuação ajustável de 0.1mm a 4.0mm, Rapid Trigger dinâmico e polling rate real de 8000Hz para counter-strafing instantâneo.',
      price: 1399.0,
      discountPrice: 1199.9,
      stock: 12,
      imageUrl:
        'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80',
      specs: JSON.stringify({
        Switch: 'Gateron Magnetic Jade Hall Effect',
        RapidTrigger: 'Sim (0.02mm de sensibilidade)',
        Atuacao: 'Ajustável de 0.1mm a 4.0mm',
        PollingRate: '8000Hz True Tachyon',
        Formato: '60% Compacto em Alumínio CNC',
        Keycaps: 'PBT Double-Shot Perfil OEM',
      }),
      featured: true,
      categoryId: categories['teclados'].id,
    },
    {
      name: 'Teclado Magnético Vortex Pulse 75% HE Gasket Mount Alumínio',
      slug: 'teclado-magnetico-vortex-pulse-75-he-gasket',
      description:
        'A combinação perfeita entre performance competitiva Hall Effect e acústica entusiasta custom. Construção Gasket Mount com plate em FR4, knob em alumínio anodizado e SOCD (Snap Tap) integrado.',
      price: 1599.0,
      discountPrice: 1449.0,
      stock: 9,
      imageUrl:
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      specs: JSON.stringify({
        Switch: 'Vortex Linear Magnetic Pro (Lubed)',
        RapidTrigger: 'Sim + Modo SOCD / Snap Tap',
        Atuacao: '0.1mm a 3.8mm',
        PollingRate: '8000Hz',
        Formato: '75% com Knob rotativo CNC',
        Estrutura: 'Gasket Mount com 5 camadas de espuma acústica',
      }),
      featured: true,
      categoryId: categories['teclados'].id,
    },
    {
      name: 'Monitor Gamer Vortex Horizon 27" QHD Fast IPS 240Hz 0.5ms',
      slug: 'monitor-vortex-horizon-27-qhd-240hz-ips',
      description:
        'Painel Fast IPS Quad HD (2560x1440) com taxa de atualização de 240Hz, tempo de resposta de 0.5ms GtG e compatibilidade G-Sync/FreeSync Premium Pro para clareza absoluta em movimento.',
      price: 2699.9,
      discountPrice: 2399.9,
      stock: 7,
      imageUrl:
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80',
      specs: JSON.stringify({
        Tela: '27 Polegadas QHD (2560x1440)',
        Painel: 'Fast IPS 10-bit (98% DCI-P3)',
        TaxaDeAtualizacao: '240Hz',
        TempoDeResposta: '0.5ms (GtG)',
        Sincronizacao: 'NVIDIA G-Sync Compatible & FreeSync Premium',
        Conexoes: '2x DisplayPort 1.4, 2x HDMI 2.1, Hub USB 3.2',
      }),
      featured: false,
      categoryId: categories['monitores'].id,
    },
    {
      name: 'Monitor Gamer Vortex Nebula 34" QD-OLED Ultrawide 360Hz 0.03ms',
      slug: 'monitor-vortex-nebula-34-qd-oled-360hz',
      description:
        'O ápice visual para setups entusiastas: painel Quantum Dot OLED de 360Hz com tempo de resposta quase instantâneo de 0.03ms, pretos perfeitos HDR True Black 400 e dissipador em grafeno.',
      price: 6899.0,
      discountPrice: 6299.0,
      stock: 4,
      imageUrl:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80',
      specs: JSON.stringify({
        Tela: '34 Polegadas WQHD (3440x1440) Curvo 1800R',
        Painel: 'QD-OLED 3ª Geração (99.3% DCI-P3)',
        TaxaDeAtualizacao: '360Hz',
        TempoDeResposta: '0.03ms (GtG)',
        HDR: 'VESA DisplayHDR True Black 400',
        Conexoes: 'DisplayPort 1.4a DSC, 2x HDMI 2.1, USB-C 90W PD',
      }),
      featured: true,
      categoryId: categories['monitores'].id,
    },
    {
      name: 'Headset Wireless Vortex Aether Pro Planar Magnético',
      slug: 'headset-wireless-vortex-aether-pro-planar',
      description:
        'Drivers planares magnéticos de 90mm que entregam palco sonoro cirúrgico para leitura de passos (footsteps) e fidelidade audiófila sem perdas via conexão sem fio de 2.4GHz Ultra-Low Latency.',
      price: 1899.0,
      discountPrice: 1699.0,
      stock: 11,
      imageUrl:
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80',
      specs: JSON.stringify({
        Driver: 'Planar Magnético de 90mm Neodímio N50',
        RespostaFrequencia: '10Hz – 50.000Hz (Hi-Res Audio)',
        Conexao: 'Wireless 2.4GHz Lossless + Bluetooth 5.3 Dual',
        Microfone: 'Boom Destacável HyperClear Supercardioide 32kHz',
        Bateria: 'Até 80 horas contínuas',
        AudioEspacial: 'Sonar DSP 3D Custom EQ',
      }),
      featured: true,
      categoryId: categories['audio'].id,
    },
    {
      name: 'In-Ear Monitor Gamer Vortex Sonic IEM Hybrid Dual-Driver',
      slug: 'in-ear-monitor-vortex-sonic-iem-hybrid',
      description:
        'IEM profissional projetado para torneios presenciais (LAN): arquitetura híbrida (1 Driver Dinâmico de Berílio + 2 Armaduras Balanceadas) com isolamento passivo de -36dB e cabo trançado em prata.',
      price: 649.9,
      discountPrice: null,
      stock: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      specs: JSON.stringify({
        Driver: 'Híbrido 1DD (10mm Berílio) + 2BA Custom',
        Impedancia: '18 Ohms',
        Sensibilidade: '108 dB/mW',
        IsolamentoAcustico: '-36dB Passivo',
        Cabo: 'Cobre OFC Banhado a Prata 2-Pin 0.78mm + DAC USB-C',
        Peso: '5.2g por cápsula (Resina Médica Impressa 3D)',
      }),
      featured: false,
      categoryId: categories['audio'].id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log(`✅ Catálogo atualizado com sucesso: ${products.length} produtos.`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
