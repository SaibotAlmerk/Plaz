import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput, Modal, Pressable } from 'react-native';

interface Plaz {
  id: string;
  jmeno: string;
  druh: string;
  narozeni: string;
  genetika: string[];
  pohlavi: string;
  poznamky: string;
}

export default function App() {
  const [plazi, setPlazi] = useState<Plaz[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [novyPlaz, setNovyPlaz] = useState<Partial<Plaz>>({});
  const [editovanyPlazId, setEditovanyPlazId] = useState<string | null>(null);

  const [druhy, setDruhy] = useState<string[]>([]);
  const [geny, setGeny] = useState<string[]>([]);

  useEffect(() => {
    // Načíst druhy
    fetch('https://plaz-api-3j5b.onrender.com/druhy') // Správný endpoint pro druhy
      .then(res => res.json())
      .then(data => setDruhy(data))
      .catch(err => console.error('Chyba při načítání druhů:', err));

    // Načíst geny
    fetch('https://plaz-api-3j5b.onrender.com/geny') // Správný endpoint pro geny
      .then(res => res.json())
      .then(data => setGeny(data))
      .catch(err => console.error('Chyba při načítání genů:', err));

    // Načíst plazi
    fetch('https://plaz-api-3j5b.onrender.com/plazi') // Správný endpoint pro plazi
      .then(res => res.json())
      .then(data => setPlazi(data))
      .catch(err => console.error('Chyba při načítání plazů:', err));
  }, []);

  const [filteredDruhy, setFilteredDruhy] = useState(druhy);
  const [filteredGeny, setFilteredGeny] = useState(geny);

  const [addedGeny, setAddedGeny] = useState<string[]>([]);
  const [showDruhy, setShowDruhy] = useState(false); // Stav pro zobrazení druhů
  const [showGeny, setShowGeny] = useState(false); // Stav pro zobrazení genů

  const otevritFormular = () => {
    setNovyPlaz({});
    setEditovanyPlazId(null);
    setAddedGeny([]);
    setModalVisible(true);
  };

  const otevritEditaci = (plaz: Plaz) => {
    setNovyPlaz(plaz);
    setEditovanyPlazId(plaz.id);
    setAddedGeny(plaz.genetika);
    setModalVisible(true);
  };

  const ulozitPlaze = () => {
    if (!novyPlaz.jmeno || !novyPlaz.druh) {
      Alert.alert('Chyba', 'Vyplňte prosím jméno a druh.');
      return;
    }

    const plazData = {
      ...novyPlaz,
      genetika: addedGeny,
    };

    if (editovanyPlazId) {
      // Odeslat PUT pro úpravu existujícího plaza
      fetch(`https://plaz-api-3j5b.onrender.com/plazi/${editovanyPlazId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plazData),
      })
        .then((res) => res.json())
        .then((updatedPlaz) => {
          setPlazi(plazi.map((plaz) => (plaz.id === editovanyPlazId ? updatedPlaz : plaz)));
          setModalVisible(false);
        })
        .catch((err) => console.error('Chyba při úpravě plaza:', err));
    } else {
      // Odeslat POST pro přidání nového plaza
      fetch('https://plaz-api-3j5b.onrender.com/plazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plazData),
      })
        .then((res) => res.json())
        .then((novy) => {
          setPlazi([novy, ...plazi]);
          setModalVisible(false);
        })
        .catch((err) => console.error('Chyba při přidávání plaza:', err));
    }
  };

  const smazatPlaze = (id: string) => {
    Alert.alert(
      'Smazat plaza',
      'Opravdu chcete tohoto plaza smazat?',
      [
        {
          text: 'Zrušit',
          style: 'cancel',
        },
        {
          text: 'Smazat',
          style: 'destructive',
          onPress: () => {
            fetch(`https://plaz-api-3j5b.onrender.com/plazi/${id}`, {
              method: 'DELETE',
            })
              .then(() => {
                setPlazi(plazi.filter((plaz) => plaz.id !== id));
              })
              .catch((err) => console.error('Chyba při mazání plaza:', err));
          },
        },
      ]
    );
  };

  const filtrovatDruhy = (text: string) => {
    setFilteredDruhy(druhy.filter(d => d.toLowerCase().includes(text.toLowerCase())));
    setShowDruhy(true); // Zobrazíme nabídku druhů, když začneme psát
  };

  const filtrovatGeny = (text: string) => {
    setFilteredGeny(geny.filter(g => g.toLowerCase().includes(text.toLowerCase())));
    setShowGeny(true); // Zobrazíme nabídku genů, když začneme psát
  };

  const pridatGen = (gen: string) => {
    if (!addedGeny.includes(gen)) {
      setAddedGeny([...addedGeny, gen]);
    }
  };

  const smazatGen = (gen: string) => {
    setAddedGeny(addedGeny.filter(g => g !== gen));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.nadpis}>Seznam plazů</Text>

      <TouchableOpacity style={styles.button} onPress={otevritFormular}>
        <Text style={styles.buttonText}>Přidat plaze</Text>
      </TouchableOpacity>

      <FlatList
        data={plazi}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.zvire}
            onPress={() => otevritEditaci(item)}
            onLongPress={() => smazatPlaze(item.id)}
          >
            <Text style={styles.jmeno}>{item.jmeno}</Text>
            <Text style={styles.druh}>{item.druh}</Text>
            <Text style={styles.dalsiInfo}>Pohlaví: {item.pohlavi}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Jméno"
              placeholderTextColor="#888"
              style={styles.input}
              onChangeText={(text) => setNovyPlaz({ ...novyPlaz, jmeno: text })}
              value={novyPlaz.jmeno}
            />
            <TextInput
              placeholder="Druh"
              placeholderTextColor="#888"
              style={styles.input}
              onChangeText={(text) => {
                setNovyPlaz({ ...novyPlaz, druh: text });
                filtrovatDruhy(text);
              }}
              value={novyPlaz.druh}
            />
            {showDruhy && filteredDruhy.length > 0 && (
              <FlatList
                data={filteredDruhy}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => {
                    setNovyPlaz({ ...novyPlaz, druh: item });
                    setShowDruhy(false); // Skryt nabídku druhů po výběru
                  }}>
                    <Text style={styles.suggestion}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TextInput
              placeholder="Geny"
              placeholderTextColor="#888"
              style={styles.input}
              onChangeText={(text) => {
                filtrovatGeny(text);
              }}
            />
            {showGeny && filteredGeny.length > 0 && (
              <FlatList
                data={filteredGeny}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => {
                    pridatGen(item);
                    setShowGeny(false); // Skryt nabídku genů po výběru
                  }}>
                    <Text style={styles.suggestion}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <View style={styles.genyBubliny}>
              {addedGeny.map((gen, index) => (
                <View key={index} style={styles.bublina}>
                  <Text style={styles.bublinaText}>{gen}</Text>
                  <TouchableOpacity onPress={() => smazatGen(gen)}>
                    <Text style={styles.smazatText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TextInput
              placeholder="Datum narození (DD/MM/YYYY)"
              placeholderTextColor="#888"
              style={styles.input}
              onChangeText={(text) => setNovyPlaz({ ...novyPlaz, narozeni: text })}
              value={novyPlaz.narozeni}
            />

            <TextInput
              placeholder="Pohlaví"
              placeholderTextColor="#888"
              style={styles.input}
              onChangeText={(text) => setNovyPlaz({ ...novyPlaz, pohlavi: text })}
              value={novyPlaz.pohlavi}
            />

            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButton} onPress={ulozitPlaze}>
                <Text style={styles.modalButtonText}>{editovanyPlazId ? 'Uložit změny' : 'Přidat plaze'}</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, { backgroundColor: '#888' }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Zrušit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}