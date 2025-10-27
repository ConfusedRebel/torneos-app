import { StyleSheet, FlatList, ActivityIndicator, TextInput, View as RNView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { TorneoCard } from '@/components/torneoCard';
import type { Torneo } from '@/types/torneo';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTorneos } from '@/providers/torneosProvider';
import React, { useEffect, useState } from 'react';
import { TEXT_STYLES } from '@/constants/Text';
import { Picker } from '@react-native-picker/picker';

type EstadoFilter = 'all' | 'pendiente' | 'en_curso' | 'finalizado';
type ModalidadFilter = 'all' | 'single' | 'doble';
type DeporteFilter = 'all' | 'paddle' | 'tennis';

export default function TorneosTab() {
  const { colors } = useTheme();
  const { list } = useTorneos();

  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const [estado, setEstado] = useState<EstadoFilter>('all');
  const [modalidad, setModalidad] = useState<ModalidadFilter>('all'); // single/doble
  const [deporte, setDeporte] = useState<DeporteFilter>('all');       // paddle/tennis

  const openTorneo = (id: string) =>
    router.push({ pathname: '/torneos/torneoDetail', params: { id } });

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        // Si tu provider soporta estos filtros, se los pasamos:
        const params: any = {
          search: debounced || undefined,
          estado: estado === 'all' ? undefined : estado,
        };
        if (modalidad !== 'all') params.duo = modalidad === 'doble'; // true = dobles
        if (deporte !== 'all') params.deporte = deporte;            // 'paddle' | 'tennis'

        const data = await list(params);

        // Fallback: si el provider ignora duo/deporte, filtramos acá
        let filtered = data;
        if (modalidad !== 'all') {
          filtered = filtered.filter(t => (modalidad === 'doble' ? t.duo : !t.duo));
        }
        if (deporte !== 'all') {
          filtered = filtered.filter(t => t.deporte?.toLowerCase() === deporte);
        }

        setTorneos(filtered);
      } catch (e) {
        console.error('Error loading torneos', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [debounced, estado, modalidad, deporte]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <RNView style={styles.filterBar}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar torneo por nombre…"
          placeholderTextColor="#999"
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
          ]}
          autoCapitalize="none"
          returnKeyType="search"
        />
        <TouchableOpacity onPress={() => setQuery('')} style={[styles.clearBtn, { borderColor: colors.border }]}>
          <Text style={{ color: colors.text }}>✕</Text>
        </TouchableOpacity>
      </RNView>

      {/* Filtros en una fila: Estado | Modalidad | Deporte */}
      <RNView style={{ paddingHorizontal: 16 }}>
        <RNView style={styles.filtersRow}>
          {/* Estado */}
          <RNView style={[styles.filterCol, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>{estado}</Text>
            <Picker
              selectedValue={estado}
              onValueChange={(v: EstadoFilter) => setEstado(v)}
              dropdownIconColor={colors.text}
              style={{ color: colors.text, flex: 1 }}
            >
              <Picker.Item label="Todos" value="all" />
              <Picker.Item label="Pendiente" value="pendiente" />
              <Picker.Item label="En curso" value="en_curso" />
              <Picker.Item label="Finalizado" value="finalizado" />
            </Picker>
          </RNView>

          {/* Modalidad */}
          <RNView style={[styles.filterCol, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>{modalidad}</Text>
            <Picker
              selectedValue={modalidad}
              onValueChange={(v: ModalidadFilter) => setModalidad(v)}
              dropdownIconColor={colors.text}
              style={{ color: colors.text, flex: 1 }}
            >
              <Picker.Item label="Todas" value="all" />
              <Picker.Item label="Single" value="single" />
              <Picker.Item label="Doble" value="doble" />
            </Picker>
          </RNView>

          {/* Deporte */}
          <RNView style={[styles.filterCol, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>{deporte}</Text>
            <Picker
              selectedValue={deporte}
              onValueChange={(v: DeporteFilter) => setDeporte(v)}
              dropdownIconColor={colors.text}
              style={{ color: colors.text, flex: 1 }}
            >
              <Picker.Item label="Todos" value="all" />
              <Picker.Item label="Paddle" value="paddle" />
              <Picker.Item label="Tennis" value="tennis" />
            </Picker>
          </RNView>
        </RNView>
      </RNView>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.tint} />
      ) : (
        <FlatList
          data={torneos}
          keyExtractor={(item) => String(item.id_torneo)}
          renderItem={({ item }) => (
            <TorneoCard torneo={item} onPress={() => openTorneo(item.id_torneo)} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[TEXT_STYLES.body, { color: colors.text, textAlign: 'center', marginTop: 24 }]}>
              No hay torneos por ahora
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 50 },
  filterBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  input: { flex: 1, height: 42, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12 },
  clearBtn: { height: 42, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, justifyContent: 'center' },

  // ---- nuevos estilos ----
  filtersRow: { flexDirection: 'row', gap: 8 },
  filterCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 48,
  },
  filterLabel: { fontSize: 14, marginRight: 8 },
});
