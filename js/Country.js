"use strict";

class Country{
  constructor(id, name_en, name_ja, name3){
    this.code3 = (id + 1000).toString().substr(1, 3)
    this.name_en = name_en
    this.name_ja = name_ja
    this.name3 = name3
  }

  flagImgTag16(){
    return '<img title="' + this.toString() + '" alt="" src="' + IMAGE_DIRECTORY + 'flags_ss/' + this.code3 + '.png"/>'
  }

  flagImgTag27(){
    return '<img title="' + this.toString() + '" alt="" src="' + IMAGE_DIRECTORY + 'flags_s/' + this.code3 + '.gif" style="vertical-align:middle"/>'
  }

  flagImgTagMovie(){
    return '<img title="' + this.toString() + '" alt="" src="' + IMAGE_DIRECTORY + 'flags_gif/' + this.code3 + '.gif" style="vertical-align:middle"/>'
  }

  name3Tag(){
    return '<span title="' + this.toString() + '">' + this.name3 + '</span>'
  }

  toString(){
    return this.name_en
    return EJ(this.name_en, this.name_ja)
  }
}

function seedCountries(){
  let hash = new Object()
  hash[4] = new Country(4, 'Afghanistan', 'アフガニスタン', 'AFG')
  hash[8] = new Country(8, 'Albania', 'アルバニア', 'ALB')
  hash[10] = new Country(10, 'Antarctica', '南極大陸', 'ATA')
  hash[12] = new Country(12, 'Algeria', 'アルジェリア', 'DZA')
  hash[16] = new Country(16, 'American Samoa', 'アメリカ領サモア', 'ASM')
  hash[20] = new Country(20, 'Andorra', 'アンドラ', 'AND')
  hash[24] = new Country(24, 'Angola', 'アンゴラ', 'AGO')
  hash[28] = new Country(28, 'Antigua and Barbuda', 'アンティグア・バーブーダ', 'ATG')
  hash[31] = new Country(31, 'Azerbaijan', 'アゼルバイジャン', 'AZE')
  hash[32] = new Country(32, 'Argentina', 'アルゼンチン', 'ARG')
  hash[36] = new Country(36, 'Australia', 'オーストラリア', 'AUS')
  hash[40] = new Country(40, 'Austria', 'オーストリア', 'AUT')
  hash[44] = new Country(44, 'Bahamas', 'バハマ', 'BHS')
  hash[48] = new Country(48, 'Bahrain', 'バーレーン', 'BHR')
  hash[50] = new Country(50, 'Bangladesh', 'バングラデシュ', 'BGD')
  hash[51] = new Country(51, 'Armenia', 'アルメニア', 'ARM')
  hash[52] = new Country(52, 'Barbados', 'バルバドス', 'BRB')
  hash[56] = new Country(56, 'Belgium', 'ベルギー', 'BEL')
  hash[60] = new Country(60, 'Bermuda', 'バミューダ', 'BMU')
  hash[64] = new Country(64, 'Bhutan', 'ブータン', 'BTN')
  hash[68] = new Country(68, 'Bolivia', 'ボリビア', 'BOL')
  hash[70] = new Country(70, 'Bosnia and Herzegovina', 'ボスニア・ヘルツェゴビナ', 'BIH')
  hash[72] = new Country(72, 'Botswana', 'ボツワナ', 'BWA')
  hash[74] = new Country(74, 'Bouvet Island', 'ブーベ諸島', 'BVT')
  hash[76] = new Country(76, 'Brazil', 'ブラジル', 'BRA')
  hash[84] = new Country(84, 'Belize', 'ベリーズ', 'BLZ')
  hash[86] = new Country(86, 'British Indian Ocean', 'イギリス', 'IOT')
  hash[90] = new Country(90, 'Solomon Islands', 'ソロモン諸島', 'SLB')
  hash[92] = new Country(92, 'Virgin Islands, British', 'イギリス', 'VGB')
  hash[96] = new Country(96, 'Brunei Darussalam', 'ブルネイ・ダルサラーム', 'BRN')
  hash[100] = new Country(100, 'Bulgaria', 'ブルガリア', 'BGR')
  hash[104] = new Country(104, 'Myanmar', 'ミャンマー', 'MMR')
  hash[108] = new Country(108, 'Burundi', 'ブルンジ', 'BDI')
  hash[112] = new Country(112, 'Belarus', 'ベラルーシ', 'BLR')
  hash[116] = new Country(116, 'Cambodia', 'カンボジア', 'KHM')
  hash[120] = new Country(120, 'Cameroon', 'カメルーン', 'CMR')
  hash[124] = new Country(124, 'Canada', 'カナダ', 'CAN')
  hash[132] = new Country(132, 'Cape Verde', 'カーボベルデ', 'CPV')
  hash[136] = new Country(136, 'Cayman Islands', 'ケイマン諸島', 'CYM')
  hash[140] = new Country(140, 'Central Africa', '中央アフリカ', 'CAF')
  hash[144] = new Country(144, 'Sri Lanka', 'スリランカ', 'LKA')
  hash[148] = new Country(148, 'Chad', 'チャド', 'TCD')
  hash[152] = new Country(152, 'Chile', 'チリ', 'CHL')
  hash[156] = new Country(156, 'China', '中国', 'CHN')
  hash[158] = new Country(158, 'Taiwan', '台湾', 'TWN')
  //hash[159] = new Country(159, 'Chinese Taipei', '中華台北', 'TPE')
  hash[159] = new Country(159, 'Taiwan', '台湾', 'TWN')
  hash[162] = new Country(162, 'Christmas Island', 'クリスマス島', 'CXR')
  hash[166] = new Country(166, 'Cocos (Keeling) Islands', 'ココス(キーリング)諸島', 'CCK')
  hash[170] = new Country(170, 'Colombia', 'コロンビア', 'COL')
  hash[174] = new Country(174, 'Comoros', 'コモロ', 'COM')
  hash[175] = new Country(175, 'Mayotte', 'マヨット', 'MYT')
  hash[178] = new Country(178, 'Congo', 'コンゴ共和国', 'COG')
  hash[180] = new Country(180, 'DR Congo', 'コンゴ民主共和国', 'COD')
  hash[184] = new Country(184, 'Cook Islands', 'クック諸島', 'COK')
  hash[188] = new Country(188, 'Costa Rica', 'コスタリカ', 'CRI')
  hash[191] = new Country(191, 'Croatia', 'クロアチア', 'HRV')
  hash[192] = new Country(192, 'Cuba', 'キューバ', 'CUB')
  hash[196] = new Country(196, 'Cyprus', 'キプロス', 'CYP')
  hash[203] = new Country(203, 'Czech', 'チェコ', 'CZE')
  hash[204] = new Country(204, 'Benin', 'ベナン', 'BEN')
  hash[208] = new Country(208, 'Denmark', 'デンマーク', 'DNK')
  hash[212] = new Country(212, 'Dominica', 'ドミニカ国', 'DMA')
  hash[214] = new Country(214, 'Dominican Rep.', 'ドミニカ共和国', 'DOM')
  hash[218] = new Country(218, 'Ecuador', 'エクアドル', 'ECU')
  hash[222] = new Country(222, 'El Salvador', 'エルサルバドル', 'SLV')
  hash[226] = new Country(226, 'Equatorial Guinea', '赤道ギニア', 'GNQ')
  hash[231] = new Country(231, 'Ethiopia', 'エチオピア', 'ETH')
  hash[232] = new Country(232, 'Eritrea', 'エリトリア', 'ERI')
  hash[233] = new Country(233, 'Estonia', 'エストニア', 'EST')
  hash[234] = new Country(234, 'Faroe Islands', 'フェロー諸島', 'FRO')
  hash[238] = new Country(238, 'Falkland Islands', 'フォークランド諸島', 'FLK')
  hash[239] = new Country(239, 'South Georgia and the South Sandwich Islands', 'サウスジョージア・サウスサンドウィッチ諸島', 'SGS')
  hash[242] = new Country(242, 'Fiji', 'フィジー', 'FJI')
  hash[246] = new Country(246, 'Finland', 'フィンランド', 'FIN')
  hash[248] = new Country(248, 'Aland Islands', 'オーランド諸島', 'ALA')
  hash[250] = new Country(250, 'France', 'フランス', 'FRA')
  hash[254] = new Country(254, 'Guiana', 'ギアナ', 'GUF')
  hash[258] = new Country(258, 'Polynesia', 'ポリネシア', 'PYF')
  hash[260] = new Country(260, 'French Southern Territories', 'フランス', 'ATF')
  hash[262] = new Country(262, 'Djibouti', 'ジブチ', 'DJI')
  hash[266] = new Country(266, 'Gabon', 'ガボン', 'GAB')
  hash[268] = new Country(268, 'Georgia', 'グルジア', 'GEO')
  hash[270] = new Country(270, 'Gambia', 'ガンビア', 'GMB')
  hash[275] = new Country(275, 'Palestinian Territories', 'パレスチナ', 'PSE')
  hash[276] = new Country(276, 'Germany', 'ドイツ', 'DEU')
  hash[288] = new Country(288, 'Ghana', 'ガーナ', 'GHA')
  hash[292] = new Country(292, 'Gibraltar', 'ジブラルタル', 'GIB')
  hash[296] = new Country(296, 'Kiribati', 'キリバス', 'KIR')
  hash[300] = new Country(300, 'Greece', 'ギリシャ', 'GRC')
  hash[304] = new Country(304, 'Greenland', 'グリーンランド', 'GRL')
  hash[308] = new Country(308, 'Grenada', 'グレナダ', 'GRD')
  hash[312] = new Country(312, 'Guadeloupe', 'グアドループ', 'GLP')
  hash[316] = new Country(316, 'Guam', 'グアム', 'GUM')
  hash[320] = new Country(320, 'Guatemala', 'グアテマラ', 'GTM')
  hash[324] = new Country(324, 'Guinea', 'ギニア', 'GIN')
  hash[328] = new Country(328, 'Guyana', 'ガイアナ', 'GUY')
  hash[332] = new Country(332, 'Haiti', 'ハイチ', 'HTI')
  hash[334] = new Country(334, 'Heard Island and McDonald Islands', 'ハード島・マクドナルド諸島', 'HMD')
  hash[336] = new Country(336, 'Vatican City State', 'バチカン市国', 'VAT')
  hash[340] = new Country(340, 'Honduras', 'ホンジュラス', 'HND')
  hash[344] = new Country(344, 'Hong Kong', '香港', 'HKG')
  hash[348] = new Country(348, 'Hungary', 'ハンガリー', 'HUN')
  hash[352] = new Country(352, 'Iceland', 'アイスランド', 'ISL')
  hash[356] = new Country(356, 'India', 'インド', 'IND')
  hash[360] = new Country(360, 'Indonesia', 'インドネシア', 'IDN')
  hash[364] = new Country(364, 'Iran', 'イラン', 'IRN')
  hash[368] = new Country(368, 'Iraq', 'イラク', 'IRQ')
  hash[372] = new Country(372, 'Ireland', 'アイルランド', 'IRL')
  hash[376] = new Country(376, 'Israel', 'イスラエル', 'ISR')
  hash[380] = new Country(380, 'Italy', 'イタリア', 'ITA')
  hash[384] = new Country(384, 'Ivory Coast', 'コートジボワール', 'CIV')
  hash[388] = new Country(388, 'Jamaica', 'ジャマイカ', 'JAM')
  hash[392] = new Country(392, 'Japan', '日本', 'JPN')
  hash[398] = new Country(398, 'Kazakhstan', 'カザフスタン', 'KAZ')
  hash[400] = new Country(400, 'Jordan', 'ヨルダン', 'JOR')
  hash[404] = new Country(404, 'Kenya', 'ケニア', 'KEN')
  hash[408] = new Country(408, 'North Korea', '北朝鮮', 'PRK')
  hash[410] = new Country(410, 'South Korea', '韓国', 'KOR')
  hash[414] = new Country(414, 'Kuwait', 'クウェート', 'KWT')
  hash[417] = new Country(417, 'Kyrgyzstan', 'キルギスタン', 'KGZ')
  hash[418] = new Country(418, 'Laos', 'ラオス', 'LAO')
  hash[422] = new Country(422, 'Lebanon', 'レバノン', 'LBN')
  hash[426] = new Country(426, 'Lesotho', 'レソト', 'LSO')
  hash[428] = new Country(428, 'Latvia', 'ラトビア', 'LVA')
  hash[430] = new Country(430, 'Liberia', 'リベリア', 'LBR')
  hash[434] = new Country(434, 'Libya', 'リビア', 'LBY')
  hash[438] = new Country(438, 'Liechtenstein', 'リヒテンシュタイン', 'LIE')
  hash[440] = new Country(440, 'Lithuania', 'リトアニア', 'LTU')
  hash[442] = new Country(442, 'Luxembourg', 'ルクセンブルグ', 'LUX')
  hash[446] = new Country(446, 'Macao', 'マカオ', 'MAC')
  hash[450] = new Country(450, 'Madagascar', 'マダガスカル', 'MDG')
  hash[454] = new Country(454, 'Malawi', 'マラウイ', 'MWI')
  hash[458] = new Country(458, 'Malaysia', 'マレーシア', 'MYS')
  hash[462] = new Country(462, 'Maldives', 'モルディブ', 'MDV')
  hash[466] = new Country(466, 'Mali', 'マリ', 'MLI')
  hash[470] = new Country(470, 'Malta', 'マルタ', 'MLT')
  hash[474] = new Country(474, 'Martinique', 'マルティニーク', 'MTQ')
  hash[478] = new Country(478, 'Mauritania', 'モーリタニア', 'MRT')
  hash[480] = new Country(480, 'Mauritius', 'モーリシャス', 'MUS')
  hash[484] = new Country(484, 'Mexico', 'メキシコ', 'MEX')
  hash[492] = new Country(492, 'Monaco', 'モナコ', 'MCO')
  hash[496] = new Country(496, 'Mongolia', 'モンゴル', 'MNG')
  hash[498] = new Country(498, 'Moldova', 'モルドバ', 'MDA')
  hash[499] = new Country(499, 'Montenegro', 'モンテネグロ', 'MNE')
  hash[500] = new Country(500, 'Montserrat', 'モントセラト', 'MSR')
  hash[504] = new Country(504, 'Morocco', 'モロッコ', 'MAR')
  hash[508] = new Country(508, 'Mozambique', 'モザンビーク', 'MOZ')
  hash[512] = new Country(512, 'Oman', 'オマーン', 'OMN')
  hash[516] = new Country(516, 'Namibia', 'ナミビア', 'NAM')
  hash[520] = new Country(520, 'Nauru', 'ナウル', 'NRU')
  hash[524] = new Country(524, 'Nepal', 'ネパール', 'NPL')
  hash[528] = new Country(528, 'Netherlands', 'オランダ', 'NLD')
  hash[530] = new Country(530, 'Netherlands Antilles', 'オランダ', 'NLD')
  hash[533] = new Country(533, 'Aruba', 'アルバ', 'ABW')
  hash[540] = new Country(540, 'New Caledonia', 'ニューカレドニア', 'NCL')
  hash[548] = new Country(548, 'Vanuatu', 'バヌアツ', 'VUT')
  hash[554] = new Country(554, 'New Zealand', 'ニュージーランド', 'NZL')
  hash[558] = new Country(558, 'Nicaragua', 'ニカラグア', 'NIC')
  hash[562] = new Country(562, 'Niger', 'ニジェール', 'NER')
  hash[566] = new Country(566, 'Nigeria', 'ナイジェリア', 'NGA')
  hash[570] = new Country(570, 'Niue', 'ニウエ', 'NIU')
  hash[574] = new Country(574, 'Norfolk Island', 'ノーフォーク島', 'NFK')
  hash[578] = new Country(578, 'Norway', 'ノルウェー', 'NOR')
  hash[580] = new Country(580, 'Northern Mariana Islands', '北マリアナ諸島', 'MNP')
  hash[581] = new Country(581, 'United States Minor Outlying Islands', 'アメリカ合衆国', 'UMI')
  hash[583] = new Country(583, 'Micronesia', 'ミクロネシア', 'FSM')
  hash[584] = new Country(584, 'Marshall Islands', 'マーシャル諸島', 'MHL')
  hash[585] = new Country(585, 'Palau', 'パラオ', 'PLW')
  hash[586] = new Country(586, 'Pakistan', 'パキスタン', 'PAK')
  hash[591] = new Country(591, 'Panama', 'パナマ', 'PAN')
  hash[598] = new Country(598, 'Papua New Guinea', 'パプアニューギニア', 'PNG')
  hash[600] = new Country(600, 'Paraguay', 'パラグアイ', 'PRY')
  hash[604] = new Country(604, 'Peru', 'ペルー', 'PER')
  hash[608] = new Country(608, 'Philippines', 'フィリピン', 'PHL')
  hash[612] = new Country(612, 'Pitcairn', 'ピトケアン', 'PCN')
  hash[616] = new Country(616, 'Poland', 'ポーランド', 'POL')
  hash[620] = new Country(620, 'Portugal', 'ポルトガル', 'PRT')
  hash[624] = new Country(624, 'Guinea-Bissau', 'ギニアビサウ', 'GNB')
  hash[626] = new Country(626, 'Timor-Leste', '東ティモール', 'TLS')
  hash[630] = new Country(630, 'Puerto Rico', 'プエルトリコ', 'PRI')
  hash[634] = new Country(634, 'Qatar', 'カタール', 'QAT')
  hash[638] = new Country(638, 'Reunion', 'レユニオン', 'REU')
  hash[642] = new Country(642, 'Romania', 'ルーマニア', 'ROU')
  hash[643] = new Country(643, 'Russia', 'ロシア', 'RUS')
  hash[646] = new Country(646, 'Rwanda', 'ルワンダ', 'RWA')
  hash[652] = new Country(652, 'Saint Barthelemy', 'サン・バルテルミー', 'BLM')
  hash[654] = new Country(654, 'Saint Helena & Dependencies', 'セントヘレナ', 'SHN')
  hash[659] = new Country(659, 'Saint Kitts and Nevis', 'セントクリストファー・ネイビス', 'KNA')
  hash[660] = new Country(660, 'Anguilla', 'アンギラ', 'AIA')
  hash[662] = new Country(662, 'Saint Lucia', 'セントルシア', 'LCA')
  hash[663] = new Country(663, 'Saint Martin', 'サン・マルタン', 'MAF')
  hash[666] = new Country(666, 'Saint Pierre and Miquelon', 'サンピエール島・ミクロン島', 'SPM')
  hash[670] = new Country(670, 'Saint Vincent and the Grenadines', 'セントビンセント/グレナディーン諸島', 'VCT')
  hash[674] = new Country(674, 'San Marino', 'サンマリノ', 'SMR')
  hash[678] = new Country(678, 'Sao Tome and Principe', 'サントメ・プリンシペ', 'STP')
  hash[682] = new Country(682, 'Saudi Arabia', 'サウジアラビア', 'SAU')
  hash[686] = new Country(686, 'Senegal', 'セネガル', 'SEN')
  hash[688] = new Country(688, 'Serbia', 'セルビア', 'SRB')
  hash[690] = new Country(690, 'Seychelles', 'セーシェル', 'SYC')
  hash[694] = new Country(694, 'Sierra Leone', 'シエラレオネ', 'SLE')
  hash[702] = new Country(702, 'Singapore', 'シンガポール', 'SGP')
  hash[703] = new Country(703, 'Slovakia', 'スロバキア', 'SVK')
  hash[704] = new Country(704, 'Vietnam', 'ベトナム', 'VNM')
  hash[705] = new Country(705, 'Slovenia', 'スロベニア', 'SVN')
  hash[706] = new Country(706, 'Somalia', 'ソマリア', 'SOM')
  hash[710] = new Country(710, 'South Africa', '南アフリカ', 'ZAF')
  hash[716] = new Country(716, 'Zimbabwe', 'ジンバブエ', 'ZWE')
  hash[724] = new Country(724, 'Spain', 'スペイン', 'ESP')
  hash[732] = new Country(732, 'Western Sahara', '西サハラ', 'ESH')
  hash[736] = new Country(736, 'Sudan', 'スーダン', 'SDN')
  hash[740] = new Country(740, 'Suriname', 'スリナム', 'SUR')
  hash[744] = new Country(744, 'Svalbard and Jan Mayen', 'スヴァールバル諸島/ヤンマイエン島', 'SJM')
  hash[748] = new Country(748, 'Swaziland', 'スワジランド', 'SWZ')
  hash[752] = new Country(752, 'Sweden', 'スウェーデン', 'SWE')
  hash[756] = new Country(756, 'Switzerland', 'スイス', 'CHE')
  hash[760] = new Country(760, 'Syria', 'シリア', 'SYR')
  hash[762] = new Country(762, 'Tajikistan', 'タジキスタン', 'TJK')
  hash[764] = new Country(764, 'Thailand', 'タイ', 'THA')
  hash[768] = new Country(768, 'Togo', 'トーゴ', 'TGO')
  hash[772] = new Country(772, 'Tokelau', 'トケラウ', 'TKL')
  hash[776] = new Country(776, 'Tonga', 'トンガ', 'TON')
  hash[780] = new Country(780, 'Trinidad and Tobago', 'トリニダードトバゴ', 'TTO')
  hash[784] = new Country(784, 'United Arab Emirates', 'アラブ首長国連邦', 'ARE')
  hash[788] = new Country(788, 'Tunisia', 'チュニジア', 'TUN')
  hash[792] = new Country(792, 'Turkey', 'トルコ', 'TUR')
  hash[795] = new Country(795, 'Turkmenistan', 'トルクメニスタン', 'TKM')
  hash[796] = new Country(796, 'Turks and Caicos Islands', 'タークス・カイコス諸島', 'TCA')
  hash[798] = new Country(798, 'Tuvalu', 'ツバル', 'TUV')
  hash[800] = new Country(800, 'Uganda', 'ウガンダ', 'UGA')
  hash[804] = new Country(804, 'Ukraine', 'ウクライナ', 'UKR')
  hash[807] = new Country(807, 'FYR Macedonia', 'マケドニア', 'MKD')
  hash[818] = new Country(818, 'Egypt', 'エジプト', 'EGY')
  hash[826] = new Country(826, 'United Kingdom', 'イギリス', 'GBR')
  hash[831] = new Country(831, 'Guernsey', 'ガーンジー', 'GGY')
  hash[832] = new Country(832, 'Jersey', 'ジャージー', 'JEY')
  hash[833] = new Country(833, 'Isle of Man', 'マン島', 'IMN')
  hash[834] = new Country(834, 'Tanzania', 'タンザニア', 'TZA')
  hash[840] = new Country(840, 'United States', 'アメリカ合衆国', 'USA')
  hash[850] = new Country(850, 'Virgin Islands, U.S.', 'アメリカ合衆国', 'VIR')
  hash[854] = new Country(854, 'Burkina Faso', 'ブルキナファソ', 'BFA')
  hash[858] = new Country(858, 'Uruguay', 'ウルグアイ', 'URY')
  hash[860] = new Country(860, 'Uzbekistan', 'ウズベキスタン', 'UZB')
  hash[862] = new Country(862, 'Venezuela', 'ベネズエラ', 'VEN')
  hash[876] = new Country(876, 'Wallis and Futuna', 'ウォリス・フツナ', 'WLF')
  hash[882] = new Country(882, 'Samoa', 'サモア', 'WSM')
  hash[887] = new Country(887, 'Yemen', 'イエメン', 'YEM')
  hash[894] = new Country(894, 'Zambia', 'ザンビア', 'ZMB')
  return hash
}
