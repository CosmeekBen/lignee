/* Prénoms et noms de famille cohérents avec la culture du pays : une personne née
   au Congo n'a pas des parents appelés Robin. Environ 45 ensembles culturels couvrent
   les 197 pays ; certains pays mélangent plusieurs ensembles (migrations, langues
   officielles multiples). Ce sont des listes de jeu, non exhaustives, qui évitent les
   caricatures sans prétendre représenter toutes les familles d'un pays. */
(function(root){const L=root.Life;
const C=(M,F,S,extra={})=>({M:M.split(' ').map(x=>x.replace(/_/g,' ')),F:F.split(' ').map(x=>x.replace(/_/g,' ')),S:S.split(' ').map(x=>x.replace(/_/g,' ')),...extra});
const cultures={
fr:C('Gabriel Louis Léo Hugo Lucas Nathan Théo Antoine Julien Mathieu Nicolas Thomas Paul Adrien Maxime Baptiste','Emma Louise Léa Chloé Manon Camille Inès Jade Clara Juliette Sarah Élise Margaux Pauline Alice Océane','Martin Bernard Dubois Thomas Robert Richard Petit Durand Leroy Moreau Simon Laurent Lefebvre Michel Garcia Fournier Girard Roux Fontaine'),
anglo:C('James Liam Noah Oliver Ethan Jack Henry Daniel Samuel Ryan Connor Mason William Thomas Jacob Owen','Emily Olivia Charlotte Grace Chloe Hannah Ella Megan Lily Ava Sophie Abigail Amelia Isla Evie Poppy','Smith Johnson Williams Brown Jones Taylor Davies Wilson Evans Walker Thompson Clark Wright Hall Green Baker Turner Hughes'),
afrocaribbean:C('Jamal Marcus Andre Dwayne Kemar Tyrone Devon Rohan Jerome Omar Malik Darius','Shanice Keisha Tamika Aaliyah Imani Alicia Monique Brianna Natalie Tanisha Jasmine Nia','Williams Brown Campbell Clarke Thompson Henry Gordon Bailey Robinson Reid Francis Joseph Charles Marshall'),
de:C('Lukas Felix Jonas Leon Maximilian Paul Elias Noah Tim Jan Moritz Niklas Finn Ben','Hannah Mia Emma Lena Lea Sophie Anna Marie Laura Lara Johanna Clara Emilia Greta','Müller Schmidt Schneider Fischer Weber Meyer Wagner Becker Hoffmann Schulz Koch Richter Klein Wolf Neumann Braun'),
nl:C('Daan Sem Lucas Milan Thijs Bram Sven Jesse Finn Luuk Ruben Stijn','Emma Julia Sophie Lotte Anna Fleur Eva Noor Sanne Iris Femke Roos','de_Jong Jansen de_Vries van_den_Berg Bakker Visser Smit Meijer de_Boer Mulder van_Dijk Bos Peters'),
nordic:C('Erik Lars Anders Oskar Nils Magnus Henrik Emil Axel Viktor Mikael Jonas Anton Elias','Astrid Freja Ingrid Sofie Maja Elin Klara Linnea Signe Ida Karin Thea Saga Nora','Andersson Johansson Hansen Larsen Nilsson Jensen Olsen Eriksen Lindberg Berg Pedersen Svensson Karlsson Holm'),
fi:C('Juha Mikko Antti Jukka Timo Matti Ville Eero Joonas Aleksi','Aino Maria Helmi Sanna Laura Johanna Emilia Venla Katja Elina','Korhonen Virtanen Mäkinen Nieminen Mäkelä Hämäläinen Laine Heikkinen Koskinen Järvinen'),
is:C('Jón Gunnar Sigurður Einar Ólafur Kristján Bjarni Magnús Stefán Atli','Guðrún Anna Sigríður Kristín Helga Margrét Katrín Ragnheiður Sólveig Björk','Jónsson Sigurðsson Gunnarsson Ólafsson Einarsson Magnússon Kristjánsson Björnsson Stefánsson'),
es:C('Santiago Mateo Sebastián Diego Alejandro Javier Carlos Andrés Daniel Luis Miguel Pablo Fernando Emilio','Sofía Valentina Camila Isabella Lucía Martina Paula Daniela Carmen Mariana Ximena Elena Rosa Gabriela','García Rodríguez Martínez López Hernández González Pérez Sánchez Ramírez Torres Flores Díaz Vargas Castillo Morales Ortega Rojas'),
pt:C('João Pedro Gabriel Rafael Lucas Miguel Mateus Guilherme Tiago Bruno Felipe Diogo Henrique','Maria Ana Beatriz Mariana Júlia Larissa Inês Camila Letícia Carolina Fernanda Sofia Helena','Silva Santos Oliveira Souza Pereira Costa Rodrigues Almeida Ferreira Carvalho Gomes Ribeiro Martins Lima Barbosa'),
ptafrica:C('Manuel Domingos António Joaquim Eduardo Zeferino Adilson Edson Délcio Nelson','Maria Luzia Isabel Esperança Graça Ana Domingas Celeste Albertina Nádia','dos_Santos da_Silva Fernandes Pereira Gomes Mendes Neto Cardoso Tavares Lopes Mateus Fonseca'),
it:C('Francesco Alessandro Lorenzo Matteo Andrea Marco Giuseppe Davide Luca Giovanni Riccardo Stefano','Sofia Giulia Aurora Alice Giorgia Chiara Francesca Martina Elena Sara Federica Valentina','Rossi Russo Ferrari Esposito Bianchi Romano Colombo Ricci Marino Greco Bruno Gallo Conti De_Luca'),
ru:C('Alexandre Dmitri Ivan Sergueï Nikolaï Andreï Mikhaïl Artem Maxime Pavel Viktor Oleg','Anastasia Maria Olga Natalia Ekaterina Elena Tatiana Irina Svetlana Daria Anna Sofia','Ivanov Petrov Sidorov Smirnov Kuznetsov Popov Volkov Sokolov Lebedev Morozov Novikov Fedorov',{fem:'slavic'}),
ua:C('Oleksandr Andriy Taras Bohdan Mykola Serhiy Yaroslav Danylo Ihor Vasyl','Oksana Olena Iryna Natalia Kateryna Svitlana Mariia Yulia Halyna Tetiana','Kovalenko Shevchenko Bondarenko Tkachenko Kravchenko Boyko Melnyk Savchenko Moroz Lysenko Marchenko Polishchuk'),
pl:C('Jan Piotr Tomasz Marek Marcin Jakub Michał Krzysztof Paweł Kamil Łukasz Adam','Anna Maria Katarzyna Magdalena Agnieszka Ewa Zofia Julia Joanna Monika Natalia Aleksandra','Kowalski Wiśniewski Wójcik Kamiński Lewandowski Zieliński Szymański Dąbrowski Nowak Kowalczyk Mazur Krawczyk',{fem:'ski'}),
balkan:C('Ivan Marko Luka Nikola Stefan Nemanja Dario Filip Miloš Aleksandar Darko Goran','Ana Marija Ivana Jelena Mia Milica Katarina Tijana Sara Maja Dunja Nina','Horvat Kovačević Petrović Jovanović Marković Nikolić Babić Pavlović Božić Kovač Novak Đorđević'),
baltic:C('Jānis Andris Mārtiņš Tomas Jonas Markus Kristjan Mart Rasmus Mindaugas','Anna Laura Līga Eglė Katrin Maarja Ieva Rūta Liis Gabija','Kalniņš Bērziņš Ozols Jonaitis Kazlauskas Tamm Saar Mägi Sepp Petrauskas'),
gr:C('Giorgos Dimitris Nikos Kostas Yannis Panagiotis Christos Alexandros Thanasis Stavros','Maria Eleni Katerina Sofia Georgia Anna Dimitra Ioanna Vasiliki Christina','Papadopoulos Georgiou Nikolaidis Dimitriou Pappas Karagiannis Vasiliou Ioannou Christodoulou Antoniou'),
ro:C('Andrei Mihai Alexandru Ion Gabriel Ștefan Cristian Vlad Radu Florin','Maria Elena Ioana Andreea Ana Cristina Mihaela Alina Raluca Diana','Popescu Ionescu Popa Radu Dumitru Stan Constantin Moldovan Munteanu Stoica'),
hu:C('Bence Máté Gábor László Péter Zoltán Ádám Balázs Dániel Tamás','Réka Anna Eszter Zsófia Katalin Dóra Boglárka Nóra Lilla Fanni','Nagy Kovács Tóth Szabó Horváth Varga Kiss Molnár Németh Farkas'),
sq:C('Arben Besnik Dritan Ardit Flamur Gent Altin Blerim Fatmir Kujtim','Elira Arta Mirela Drita Vjosa Besa Blerta Ermira Fjolla Teuta','Hoxha Krasniqi Berisha Gashi Shehu Hysi Dervishi Kelmendi Leka Prifti'),
tr:C('Mehmet Mustafa Ahmet Ali Emre Burak Yusuf Kerem Murat Hasan Can Ömer','Ayşe Fatma Zeynep Elif Emine Merve Defne Büşra Selin Esra Derya Hülya','Yılmaz Kaya Demir Şahin Çelik Yıldız Aydın Öztürk Arslan Doğan Kılıç Çetin'),
centralasia:C('Aibek Timur Bakhtiyor Dastan Nurlan Rustam Azamat Farrukh Askar Daniyar','Aigerim Madina Dilnoza Zarina Aliya Gulnara Nargiza Malika Saule Dinara','Nurmagambetov Karimov Rakhimov Abdullaev Tursunov Sadykov Usmanov Ismailov Akhmetov Bekov'),
mn:C('Batbayar Temuulen Ganbold Enkhbat Bold Tuvshin Munkh Erdene','Oyuna Narantuya Solongo Munkhzul Anu Tsetseg Khongor Uyanga','Bat Dorj Ganbaatar Batsukh Tseren Gombo Erdenebat Sukh'),
arlevant:C('Omar Ahmad Khaled Yousef Hassan Ali Samer Tariq Ziad Rami Fadi Karim','Layla Noor Rania Dina Maya Hala Salma Lina Yasmin Reem Nour Joumana','Haddad Khoury Nasser Hussein Saleh Mansour Ibrahim Darwish Khalil Abboud Barakat Sabbagh'),
he:C('Noam Yonatan Eitan Daniel Itai Amir Ori Lior Tal Yoav','Noa Tamar Shira Maya Yael Talia Michal Avigail Ayelet Hila','Cohen Levi Mizrahi Peretz Biton Avraham Friedman Katz Dahan Azoulay'),
argulf:C('Abdullah Mohammed Khalid Faisal Salman Saud Nasser Hamad Rashid Sultan Majid Saeed','Fatima Noura Maryam Aisha Sara Hessa Latifa Mozah Reem Shamma Amna Hind','Al_Qahtani Al_Harbi Al_Otaibi Al_Zahrani Al_Mansoori Al_Ketbi Al_Kuwari Al_Mazrouei Al_Balushi Al_Hinai Al_Ghamdi Al_Dosari'),
maghreb:C('Youssef Mehdi Amine Anis Karim Rachid Hamza Walid Sami Nabil Bilal Adam','Salma Imane Meriem Sara Khadija Nour Hajar Rim Yasmine Ines Lina Houda','Benali Bouzid Trabelsi Mansouri El_Idrissi Alaoui Bennani Haddad Cherif Saidi Ben_Salah Mrabet Belkacem'),
egypt:C('Mohamed Ahmed Mahmoud Mostafa Omar Ali Hassan Karim Tarek Hossam Youssef Khaled','Fatma Mona Heba Nour Salma Aya Mariam Rania Dalia Yasmin Hoda Mai','Hassan Ibrahim Mahmoud Abdelrahman Mostafa Salem Farouk Gamal Fahmy Soliman Mansour Abdelaziz'),
sudan:C('Mohamed Ahmed Omar Osman Abdelrahman Khalid Yassir Mazin Bashir Ibrahim Hamza Mubarak','Amira Hiba Sara Nadia Samah Asma Rawan Aisha Mona Safaa Zainab Reem','Osman Elamin Elhaj Abdalla Idris Babiker Hamid Suleiman Adam Elnour Omer Khalil'),
southsudan:C('Deng Garang Majok Kuol Akol Chol Mading Manyang Mabior Thon','Nyadak Achol Ayen Adut Nyibol Abuk Akuol Nyanath Rebecca Mary','Deng Garang Majok Kuol Akol Chol Mabior Dau Makuei Atem'),
somali:C('Abdi Mohamed Hassan Ali Omar Ahmed Yusuf Warsame Abdullahi Ismail Farhan','Fadumo Amina Hodan Ifrah Sagal Halima Ayaan Faduma Idil Muna Ladan','Ali Hassan Abdi Warsame Jama Farah Ahmed Nur Omar Dahir Mohamud'),
ethiopia:C('Abebe Dawit Yonas Kidus Tesfaye Henok Bereket Samuel Mulugeta Getachew Biruk Eyob','Almaz Selam Tigist Meron Hanna Rahel Mulu Bethlehem Tsion Hiwot Bezawit Senait','Abebe Tadesse Bekele Haile Alemu Girma Kebede Tesfaye Mengistu Assefa',{surnameFromFather:true}),
eastafrica:C('Kamau Otieno Kiprop Mwangi Juma Brian Kevin Dennis Collins Peter Hamisi Baraka','Wanjiru Akinyi Chebet Njeri Atieno Faith Mercy Grace Joy Esther Neema Zawadi','Kamau Otieno Mwangi Kiptoo Wafula Ochieng Njoroge Kariuki Mutua Odhiambo Wekesa Mushi'),
rwanda:C('Jean-Claude Eric Patrick Emmanuel Innocent Olivier Didier Aimable Fabrice Eugène','Aline Josiane Claudine Immaculée Marie-Rose Solange Francine Beata Jeannette Clarisse','Uwimana Habimana Mukamana Niyonzima Nsengimana Hakizimana Ndayisaba Nshimiyimana Irakoze Niyonkuru Mugisha'),
southafrica:C('Thabo Sipho Themba Lungile Bongani Siyabonga Johan Pieter Sizwe Mandla Tshepo Kagiso','Nomvula Thandi Lerato Zanele Precious Ayanda Naledi Lindiwe Anika Karabo Palesa Nokuthula','Nkosi Dlamini Khumalo Ndlovu Mokoena Zulu Mahlangu Sithole van_der_Merwe Botha Naidoo Molefe'),
madagascar:C('Andry Hery Mamy Rivo Tojo Faly Fenitra Njaka Tiana Haja','Voahangy Hanta Lalao Mialy Fara Tiana Vola Lanto Soa Miora','Rakoto Rasoamanana Razafy Randria Andrianina Ravelo Rabe Rakotomalala Rasolofo Ratsimba'),
nigeria:C('Chinedu Emeka Oluwaseun Ibrahim Tunde Chukwudi Musa Kelechi Yusuf Segun Ifeanyi Abubakar','Chioma Ngozi Aisha Folake Amina Adaeze Funmilayo Blessing Zainab Ifeoma Yetunde Halima','Okafor Adeyemi Bello Ogunleye Eze Abdullahi Nwosu Balogun Okonkwo Ibrahim Adebayo Olawale'),
ghana:C('Kwame Kofi Kwabena Yaw Kwesi Nana Emmanuel Samuel Kojo Yaa Kwaku Fiifi','Ama Akosua Abena Esi Efua Adwoa Gifty Comfort Afia Akua Abla Serwaa','Mensah Owusu Boateng Asante Appiah Agyeman Osei Addo Acheampong Quartey Amoah Darko'),
frwest:C('Amadou Moussa Ibrahima Ousmane Mamadou Seydou Issouf Kouassi Yao Abdoulaye Cheikh Boubacar Souleymane Karim','Fatou Aminata Awa Mariam Aïcha Khadija Rokia Bintou Adjoua Nafissatou Fanta Kadiatou Salimata Aissatou','Diallo Traoré Diop Ndiaye Sow Konaté Coulibaly Ouédraogo Keïta Camara Sanogo Bah Sy Koné Touré Barry Cissé Sylla'),
central:C('Patrick Jean-Pierre Joseph Prince Dieudonné Christian Fiston Trésor Junior Papy Blaise Héritier Jonathan Serge','Grace Espérance Béatrice Nadège Chantal Merveille Rachel Précieuse Divine Joëlle Sarah Christelle Marie-Louise Ruth','Mukendi Kasongo Ilunga Mbuyi Kalala Mutombo Ngoy Kabamba Mwamba Banza Tshibangu Nsimba Lukusa Kitenge Mpoyi Kalonji Kanyinda'),
hindi:C('Aarav Arjun Rohan Vikram Rahul Amit Sanjay Karan Rajesh Anil Aditya Vivek','Priya Ananya Aditi Neha Kavya Sunita Pooja Lakshmi Meera Divya Shreya Anjali','Sharma Patel Singh Kumar Gupta Reddy Iyer Nair Mehta Joshi Das Verma Chatterjee Banerjee'),
nepal:C('Bikash Suman Prakash Rajan Sujan Ramesh Dipesh Nabin Sandesh Anil','Sita Anita Sunita Sabina Kamala Puja Sarita Binita Manisha Rina','Thapa Gurung Shrestha Rai Tamang Karki Adhikari Magar Bhandari Basnet'),
srilanka:C('Nuwan Kasun Dinesh Chamara Ruwan Lahiru Sampath Tharindu Mahesh','Nimali Dilani Chathuri Sandya Kumari Dilhani Anusha Hasini Madhavi','Perera Fernando Silva Jayasinghe Wickramasinghe Bandara Gunawardena Herath Samaranayake Weerasinghe'),
maldives:C('Ahmed Ali Hussain Ibrahim Mohamed Hassan Ismail Shiham Yoosuf','Aminath Fathimath Mariyam Aishath Hawwa Khadheeja Zeenath Shaheema','Rasheed Waheed Naseem Latheef Shareef Saeed Adam Moosa'),
bengal:C('Rahim Karim Mizanur Hasan Rafiq Tanvir Imran Sajib Shahin Jahid Tamim Rubel','Fatema Ayesha Nusrat Sultana Rina Shirin Farzana Jannat Mim Taslima Sumaiya Rumana','Hossain Rahman Islam Ahmed Khan Chowdhury Uddin Sarkar Mia Alam Miah Mondal'),
pakistan:C('Ahmed Ali Hassan Usman Bilal Hamza Imran Faisal Zain Tariq Asad Waqar','Ayesha Fatima Zainab Maryam Sana Hira Amna Noor Saima Sadia Iqra Mahnoor','Khan Malik Hussain Sheikh Qureshi Butt Ansari Chaudhry Raza Siddiqui Baloch Mirza'),
afghan:C('Ahmad Mohammad Zabihullah Farid Najib Hamid Rahim Sediq Jawad Nasir','Fatima Zahra Mariam Nilab Roya Laila Shabnam Parwana Mursal Hasina','Ahmadzai Sadat Popalzai Karimi Noori Rahimi Stanikzai Hashimi Safi Faizi'),
persian:C('Mohammad Ali Reza Hossein Mehdi Amir Arash Kourosh Babak Saeed Hamed Pouya','Fatemeh Zahra Maryam Narges Shirin Sara Mina Parisa Leila Negar Sahar Yasaman','Hosseini Ahmadi Rezaei Mohammadi Karimi Jafari Moradi Farahani Rostami Najafi Hashemi Ebrahimi'),
chinese:C('Wei Jun Hao Lei Ming Jian Tao Yang Bo Chen Qiang Peng','Mei Li Xiu Yan Jing Fang Hui Ling Na Xin Yu Lan','Wang Li Zhang Liu Chen Yang Huang Zhao Wu Zhou Xu Sun Ma Zhu Hu Guo'),
japanese:C('Haruto Ren Sora Yuto Kenji Takumi Daiki Hiroshi Kaito Riku Shota Hayato','Yui Hina Sakura Aoi Yuna Mio Haruka Akari Mei Rin Misaki Nanami','Sato Suzuki Takahashi Tanaka Watanabe Ito Yamamoto Nakamura Kobayashi Kato Yoshida Yamada'),
korean:C('Min-jun Seo-jun Ji-ho Hyun-woo Joon-ho Sung-min Dong-hyun Tae-yang Do-yun Ye-jun','Seo-yeon Ji-woo Ha-eun Soo-ah Min-seo Yoo-na Ji-min Eun-ji Da-eun Chae-won','Kim Lee Park Choi Jung Kang Cho Yoon Jang Lim Han Shin'),
vietnam:C('Minh Anh Huy Quang Hung Duc Tuan Long Khoa Nam Bao Khanh','Linh Lan Mai Hoa Ngoc Thu Huong Trang Phuong Thao Hanh Yen','Nguyen Tran Le Pham Hoang Huynh Phan Vu Vo Dang Bui Do'),
thai:C('Somchai Anan Kittisak Natthapong Pichai Surachai Thanawat Chaiwat Nattapong Prasert','Siriporn Napat Pimchanok Ploy Kanya Nattaya Jiraporn Suda Malee Orn','Saetang Wongsakul Chaiyasit Srisai Thongchai Rattanakorn Boonmee Jaidee Sukhum Phetcharat'),
indonesia:C('Budi Agus Andi Rizky Dian Eko Fajar Hendra Bayu Putra Dimas Rangga','Siti Dewi Putri Ayu Sri Rina Wulan Indah Fitri Nur Intan Ratna','Santoso Wijaya Kusuma Hidayat Saputra Pratama Susanto Setiawan Nugroho Lestari Wibowo Hartono'),
malay:C('Ahmad Muhammad Hafiz Amir Faiz Irfan Syafiq Haziq Farhan Zul','Nur_Aisyah Siti Aina Farah Nurul Aisyah Balqis Alya Husna Hannah','Abdullah Ismail Hassan Rahman Yusof Ibrahim Tan Lim Wong Lee Kumar'),
filipino:C('Jose Juan Miguel Carlo Mark Paolo Rafael Joshua Angelo Francis John_Paul Jericho','Maria Angelica Jasmine Kristine Mary_Grace Nicole Patricia Kyla Bea Camille Jessa Ma._Cristina','Santos Reyes Cruz Bautista Garcia Mendoza Villanueva Ramos Aquino Dela_Cruz Torres Castillo'),
burma:C('Aung Kyaw Zaw Htet Min Thura Soe Naing Zin Tun','Aye Su Hnin Thandar Khin Mya Phyu Nandar Moe Ei','Win Oo Aung Naing Htun Lwin Kyaw Maung Tin Soe'),
khmer:C('Sokha Vannak Rithy Sophal Dara Chea Pich Veasna Sovann Kosal','Sreymom Sophea Chenda Vanna Dalin Srey_Leak Sokunthea Chanthou Sreynich Rachana','Chea Sok Kim Chan Srey Keo Heng Ly Sam Meas'),
lao:C('Somphone Khamla Bounmy Anousone Khamphay Somchai Vanh Phonsavanh','Noy Vilay Phetsamone Dalavanh Souksan Manivone Khamsy Vongdara','Sisavath Phommachanh Keomany Vongsay Sengdara Phanthavong Inthavong Xayavong'),
armenian:C('Armen Hayk Narek Davit Aram Garik Artur Tigran Vahe Levon','Anahit Mariam Ani Lilit Narine Satenik Arpine Gayane Hasmik Mane','Hakobyan Grigoryan Sargsyan Petrosyan Harutyunyan Avetisyan Mkrtchyan Vardanyan Gevorgyan Manukyan'),
georgian:C('Giorgi Levan Nika Davit Irakli Zurab Lasha Luka Tornike Sandro','Nino Mariam Ana Tamar Nana Ketevan Salome Eka Mzia Natia','Beridze Kapanadze Gelashvili Maisuradze Lomidze Khutsishvili Gogiashvili Japaridze Kvaratskhelia Tsiklauri'),
pacific:C('Sione Tevita Malo Viliami Lui Aleki Tomasi Folau Josefa Isoa','Mele Losa Salote Ana Lupe Sina Tui Litia Ema Sera','Tuilagi Fonoti Faleolo Taufa Latu Havili Vea Tupou Naivalu Tuiasosopo')
};
/* Pays → ensemble culturel (ou mélange avec des poids). */
const map={};const add=(code,list)=>{for(const c of list.split(' '))map[c]=code};
add('fr','FR MC MU SC HT');add('frwest','SN ML BF CI NE TG BJ GN MR');add('central','CD CG GA CM CF TD');add('rwanda','RW BI');
add('anglo','GB IE AU NZ');add('afrocaribbean','JM TT GY BB BS AG GD DM KN VC LC BZ');
add('de','DE AT LI');add('nl','NL SR');add('nordic','SE NO DK');add('fi','FI');add('is','IS');
add('es','ES MX CO AR CL PE VE EC GT CU DO BO PY UY HN SV NI CR PA GQ');add('pt','PT BR');add('ptafrica','AO MZ CV GW ST TL');add('it','IT SM VA MT');
add('ru','RU BY');add('ua','UA MD');add('pl','PL CZ SK');add('balkan','HR RS BA ME MK SI BG');add('sq','AL XK');add('baltic','EE LV LT');add('gr','GR CY');add('ro','RO');add('hu','HU');
add('tr','TR AZ TM');add('centralasia','KZ UZ KG TJ');add('mn','MN');add('arlevant','SY LB JO PS IQ');add('he','IL');add('argulf','SA AE QA KW BH OM YE');add('maghreb','MA DZ TN LY');add('egypt','EG');add('sudan','SD');add('southsudan','SS');add('somali','SO DJ');add('ethiopia','ET ER');
add('eastafrica','KE TZ UG MW ZM');add('southafrica','ZA ZW BW NA LS SZ');add('madagascar','MG KM');add('nigeria','NG');add('ghana','GH LR SL GM');
add('hindi','IN');add('nepal','NP BT');add('srilanka','LK');add('maldives','MV');add('bengal','BD');add('pakistan','PK');add('afghan','AF');add('persian','IR');
add('chinese','CN TW');add('japanese','JP');add('korean','KR KP');add('vietnam','VN');add('thai','TH');add('indonesia','ID BN');add('malay','MY');add('filipino','PH');add('burma','MM');add('khmer','KH');add('lao','LA');add('armenian','AM');add('georgian','GE');
add('pacific','WS TO TV KI MH FM NR PW SB VU PG FJ');
/* Pays métissés : poids par ensemble. */
const mixes={
US:{anglo:.6,es:.18,afrocaribbean:.1,chinese:.03,hindi:.03,korean:.02,arlevant:.02,fr:.02},CA:{anglo:.6,fr:.2,chinese:.07,hindi:.07,es:.03,filipino:.03},
GB:{anglo:.82,hindi:.05,pakistan:.04,afrocaribbean:.04,nigeria:.025,pl:.025},FR:{fr:.78,maghreb:.12,frwest:.04,pt:.03,es:.03},DE:{de:.82,tr:.09,ru:.04,pl:.03,arlevant:.02},
CH:{de:.6,fr:.25,it:.1,pt:.05},BE:{fr:.45,nl:.45,maghreb:.1},LU:{fr:.4,de:.3,pt:.3},AU:{anglo:.8,chinese:.08,hindi:.07,filipino:.05},SG:{chinese:.7,malay:.15,hindi:.15},
AE:{argulf:.2,hindi:.35,pakistan:.15,filipino:.1,egypt:.1,anglo:.1},QA:{argulf:.2,hindi:.35,bengal:.15,filipino:.1,egypt:.1,nepal:.1},SA:{argulf:.65,egypt:.1,pakistan:.1,bengal:.05,hindi:.05,filipino:.05},
KW:{argulf:.45,egypt:.2,hindi:.2,filipino:.15},MU:{fr:.4,hindi:.6},ZA:{southafrica:.85,hindi:.05,anglo:.1},NZ:{anglo:.78,pacific:.1,chinese:.06,hindi:.06},
MY:{malay:.6,chinese:.3,hindi:.1},FJ:{pacific:.55,hindi:.45},TT:{afrocaribbean:.5,hindi:.5},GY:{afrocaribbean:.5,hindi:.5},BR:{pt:.97,japanese:.03}};
const regionFallback={Asie:'chinese',Afrique:'frwest',Europe:'fr',Amériques:'es',Océanie:'pacific'};
const hash=(...a)=>L.hash(a.join('|'));
function cultureFor(s,code,key){const mix=mixes[code];if(mix){const u=hash(s.seed,'culture',code,key);let acc=0;for(const[k,w]of Object.entries(mix)){acc+=w;if(u<acc)return k}return Object.keys(mix)[0]}
  return map[code]||regionFallback[L.countries.find(c=>c.code===code)?.region]||'fr'}
const femForms={slavic:n=>/(ov|ev|in|sky)$/.test(n)?n+'a':n,ski:n=>/ski$/.test(n)?n.slice(0,-1)+'a':/cki$/.test(n)?n.slice(0,-1)+'a':n};
function femSurname(cul,sn,sex){const f=cultures[cul]?.fem;return sex==='F'&&f?(femForms[f]||femForms.slavic)(sn):sn}
const pickFrom=(list,u)=>list[Math.floor(u*list.length)%list.length];
/* Un nom plausible pour une personne de ce pays. role/key garantissent des tirages stables sans consommer le hasard du moteur. */
function nameFor(s,{country,origin,sex,role='x',key='',fatherGiven,culture}={}){const code=origin||country||'FR',cul=culture||cultureFor(s,code,role+'|'+key),data=cultures[cul]||cultures.fr;
  const sx=sex||(hash(s.seed,'sex',role,key)<.512?'M':'F'),given=pickFrom(data[sx],hash(s.seed,'given',cul,role,key));
  let surname=pickFrom(data.S,hash(s.seed,'sur',cul,role,key));if(data.surnameFromFather&&fatherGiven)surname=fatherGiven;
  return{given,surname:femSurname(cul,surname,sx),sex:sx,culture:cul}}
/* Applique des noms cohérents à une personne tout juste née et à ses parents. */
function nameFamily(s){const p=s.person,code=p.origin||p.country;if(p.namedByCulture)return;
  const sx=p.sex||(p.birth?.sex)||undefined;
  const father=nameFor(s,{country:code,origin:code,sex:'M',role:'father',key:p.id}),mother=nameFor(s,{country:code,origin:code,sex:'F',role:'mother',key:p.id,culture:hash(s.seed,'couple',p.id)<.8?father.culture:undefined});
  const me=nameFor(s,{country:code,origin:code,sex:sx,role:'self',key:p.id,fatherGiven:father.given,culture:father.culture});
  const base=cultures[father.culture]?.fem?father.surname:father.surname;
  p.name=me.given;p.surname=cultures[me.culture]?.surnameFromFather?father.given:femSurname(father.culture,base,me.sex);p.culture=father.culture;
  p.parents=[{name:mother.given,surname:femSurname(mother.culture,mother.surname,'F'),role:'mère',sex:'F',bond:p.parents?.[0]?.bond??75},{name:father.given,surname:base,role:'père',sex:'M',bond:p.parents?.[1]?.bond??70}];
  p.namedByCulture=true}
L.nameFor=nameFor;L.nameCultures=cultures;L.cultureOf=(s,code)=>cultureFor(s,code,'');L.nameFamily=nameFamily;
const baseCreate=L.create;L.create=function(seed,code,year){const s=baseCreate(seed,code,year);nameFamily(s);return s};
})(typeof window!=='undefined'?window:globalThis);
