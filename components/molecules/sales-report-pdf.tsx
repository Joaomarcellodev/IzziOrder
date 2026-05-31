"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Svg, Path, Polyline, Circle, Line } from '@react-pdf/renderer';
import { SalesReport, SalesReportFilters } from '@/lib/entities/report';
import { format, parseISO } from 'date-fns';
import { COLORS, CHART_COLORS, ORDER_TYPE_LABELS } from '@/app/auth/reports/constants';

const BRAND_COLORS = {
  blue: '#007BFF',
  orange: '#FD7E14',
  dark: '#0f172a',
  gray: '#64748b',
  border: '#e2e8f0',
  zebra: '#f8fafc'
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  brandIzzi: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BRAND_COLORS.blue,
  },
  brandOrder: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BRAND_COLORS.orange,
  },
  headerInfo: {
    textAlign: 'right',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    textTransform: 'uppercase',
  },
  reportSubtitle: {
    fontSize: 9,
    color: BRAND_COLORS.gray,
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  kpiCard: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border,
    borderTopWidth: 3,
  },
  kpiLabel: {
    fontSize: 7,
    color: BRAND_COLORS.gray,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
  },
  chartSection: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 25,
  },
  chartCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  chartTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    marginBottom: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: BRAND_COLORS.gray,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 4,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    minHeight: 24,
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.border,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    minHeight: 28,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  cellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
  },
  cell: {
    fontSize: 8,
    color: BRAND_COLORS.dark,
  },
  colMain: { flex: 1 },
  colRight: { width: 100, textAlign: 'right' },
  colCenter: { width: 60, textAlign: 'center' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: BRAND_COLORS.gray,
    fontSize: 7,
  }
});

// NATIVE SVG CHARTS
const PDFDonutChart = ({ data, colors, labels, size = 100 }: { data: number[], colors: string[], labels: string[], size?: number }) => {
  const total = data.reduce((a, b) => a + b, 0);
  if (total === 0) return <Text style={{fontSize: 8, color: BRAND_COLORS.gray}}>Nenhum dado disponível</Text>;

  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.45;
  const r = size * 0.25;
  let currentAngle = -Math.PI / 2;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
      <Svg width={size} height={size}>
        {data.map((value, idx) => {
          if (value === 0) return null;
          const sliceAngle = (value / total) * 2 * Math.PI;
          
          if (sliceAngle >= 2 * Math.PI - 0.001) {
            return <Circle key={idx} cx={cx} cy={cy} r={(R+r)/2} strokeWidth={R-r} stroke={colors[idx]} fill="none" />;
          }

          const endAngle = currentAngle + sliceAngle;
          const x1 = cx + R * Math.cos(currentAngle);
          const y1 = cy + R * Math.sin(currentAngle);
          const x2 = cx + R * Math.cos(endAngle);
          const y2 = cy + R * Math.sin(endAngle);
          const innerX1 = cx + r * Math.cos(currentAngle);
          const innerY1 = cy + r * Math.sin(currentAngle);
          const innerX2 = cx + r * Math.cos(endAngle);
          const innerY2 = cy + r * Math.sin(endAngle);

          const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
          const pathData = [
            `M ${innerX1} ${innerY1}`,
            `L ${x1} ${y1}`,
            `A ${R} ${R} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${innerX2} ${innerY2}`,
            `A ${r} ${r} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
            'Z'
          ].join(' ');

          currentAngle = endAngle;
          return <Path key={idx} d={pathData} fill={colors[idx]} />;
        })}
      </Svg>

      {/* LEGENDA DO GRÁFICO DE PIZZA */}
      <View style={{ gap: 4 }}>
        {data.map((value, idx) => {
           if (value === 0) return null;
           const percent = ((value / total) * 100).toFixed(1);
           return (
             <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
               <View style={{ width: 6, height: 6, backgroundColor: colors[idx], borderRadius: 3 }} />
               <Text style={{ fontSize: 7, color: BRAND_COLORS.dark }}>
                 {labels[idx]}: <Text style={{ fontWeight: 'bold' }}>{percent}%</Text>
               </Text>
             </View>
           );
        })}
      </View>
    </View>
  );
};

const PDFLineChart = ({ data, dates, width, height, color }: { data: number[], dates: string[], width: number, height: number, color: string }) => {
  const max = Math.max(...data, 1);
  const usableHeight = height - 10;
  
  const points = data.map((val, idx) => {
    const x = data.length > 1 ? (idx / (data.length - 1)) * width : width / 2;
    const y = usableHeight - (val / max) * usableHeight + 5;
    return `${x},${y}`;
  }).join(' ');

  const firstDate = dates.length > 0 ? dates[0] : '';
  const lastDate = dates.length > 1 ? dates[dates.length - 1] : '';

  return (
    <View style={{ flexDirection: 'row' }}>
      {/* EIXO Y (VALORES) */}
      <View style={{ justifyContent: 'space-between', height: height, marginRight: 5, paddingVertical: 2 }}>
        <Text style={{ fontSize: 6, color: BRAND_COLORS.gray }}>R$ {max.toFixed(0)}</Text>
        <Text style={{ fontSize: 6, color: BRAND_COLORS.gray }}>R$ {(max/2).toFixed(0)}</Text>
        <Text style={{ fontSize: 6, color: BRAND_COLORS.gray }}>R$ 0</Text>
      </View>
      
      <View>
        <Svg width={width} height={height}>
          {/* Grid lines */}
          <Line x1={0} y1={height - 5} x2={width} y2={height - 5} stroke="#f1f5f9" strokeWidth={1} />
          <Line x1={0} y1={height/2} x2={width} y2={height/2} stroke="#f1f5f9" strokeWidth={1} />
          <Line x1={0} y1={5} x2={width} y2={5} stroke="#f1f5f9" strokeWidth={1} />
          
          {data.length > 1 && <Polyline points={points} stroke={color} strokeWidth={2} fill="none" />}
          {data.map((val, idx) => {
            const x = data.length > 1 ? (idx / (data.length - 1)) * width : width / 2;
            const y = usableHeight - (val / max) * usableHeight + 5;
            return <Circle key={idx} cx={x} cy={y} r={2} fill={color} stroke="#ffffff" strokeWidth={1} />;
          })}
        </Svg>
        
        {/* EIXO X (DATAS) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width, marginTop: 4 }}>
           <Text style={{ fontSize: 6, color: BRAND_COLORS.gray }}>{firstDate}</Text>
           {lastDate && <Text style={{ fontSize: 6, color: BRAND_COLORS.gray }}>{lastDate}</Text>}
        </View>
      </View>
    </View>
  );
};


interface SalesReportPDFProps {
  report: SalesReport;
  filters: SalesReportFilters;
}

export const SalesReportPDF = ({ report, filters }: SalesReportPDFProps) => {
  const isClient = typeof window !== 'undefined';
  const logoUrl = isClient ? `${window.location.origin}/apple-touch-icon.png` : '/apple-touch-icon.png';

  const startDate = filters.startDate ? format(parseISO(filters.startDate), "dd/MM/yyyy") : 'Início';
  const endDate = filters.endDate ? format(parseISO(filters.endDate), "dd/MM/yyyy") : 'Fim';
  
  const totalOrders = report.salesByDay.reduce((acc, day) => acc + day.count, 0);
  const averageTicket = totalOrders > 0 ? report.generalTotalSales / totalOrders : 0;

  const formatPaymentMethod = (method: string) => {
    if (!method) return "Outros";
    if (method.includes("ESPECIE") || method === "DINHEIRO") return "Espécie";
    return method.charAt(0) + method.slice(1).toLowerCase().replace("_", " ");
  };

  // Prepara dados dos gráficos
  const revenueData = report.salesByDay.map(d => d.total);
  const revenueDates = report.salesByDay.map(d => format(parseISO(d.date), "dd/MM"));
  
  const distributionData = report.ordersByType.map(t => t.count);
  const distributionLabels = report.ordersByType.map(t => ORDER_TYPE_LABELS[t.type] || t.type);
  const distributionColors = report.ordersByType.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  // Filtra itens zerados
  const soldProducts = report.salesByProduct.filter(item => item.quantity > 0);

  return (
    <Document title={`Relatório izziOrder - ${endDate}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={logoUrl} style={styles.logoImage} />
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.brandIzzi}>izzi</Text>
              <Text style={styles.brandOrder}>Order</Text>
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.reportTitle}>Relatório de Vendas</Text>
            <Text style={styles.reportSubtitle}>{startDate} - {endDate}</Text>
          </View>
        </View>

        {/* KPIs */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, { borderTopColor: BRAND_COLORS.blue }]}>
            <Text style={styles.kpiLabel}>Total de Vendas</Text>
            <Text style={styles.kpiValue}>R$ {report.generalTotalSales.toFixed(2)}</Text>
          </View>
          <View style={[styles.kpiCard, { borderTopColor: COLORS.success }]}>
            <Text style={styles.kpiLabel}>Total de Pedidos</Text>
            <Text style={styles.kpiValue}>{totalOrders}</Text>
          </View>
          <View style={[styles.kpiCard, { borderTopColor: COLORS.danger }]}>
            <Text style={styles.kpiLabel}>Ticket Médio</Text>
            <Text style={styles.kpiValue}>R$ {averageTicket.toFixed(2)}</Text>
          </View>
        </View>

        {/* NATIVE CHARTS SECTION */}
        <View style={styles.chartSection}>
           <View style={[styles.chartCard, { flex: 2 }]}>
              <Text style={styles.chartTitle}>Fluxo de Receita (Diário)</Text>
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
                 <PDFLineChart data={revenueData} dates={revenueDates} width={220} height={80} color={COLORS.primary} />
              </View>
           </View>

           <View style={[styles.chartCard, { flex: 1.5 }]}>
              <Text style={styles.chartTitle}>Origem dos Pedidos</Text>
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
                 <PDFDonutChart data={distributionData} colors={distributionColors} labels={distributionLabels} size={80} />
              </View>
           </View>
        </View>

        {/* TABLES */}
        <View style={{ flexDirection: 'row', gap: 25, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Canais de Venda</Text>
            <View style={styles.table}>
              {report.ordersByType.map((t, idx) => (
                <View key={idx} style={[styles.tableRow, { backgroundColor: idx % 2 === 1 ? BRAND_COLORS.zebra : '#FFFFFF' }]}>
                  <Text style={[styles.cell, styles.colMain]}>{ORDER_TYPE_LABELS[t.type] || t.type}</Text>
                  <Text style={[styles.cell, styles.colRight, { fontWeight: 'bold' }]}>R$ {t.total.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Meios de Pagamento</Text>
            <View style={styles.table}>
              {report.salesByPaymentMethod.map((p, idx) => (
                <View key={idx} style={[styles.tableRow, { backgroundColor: idx % 2 === 1 ? BRAND_COLORS.zebra : '#FFFFFF' }]}>
                  <Text style={[styles.cell, styles.colMain]}>{formatPaymentMethod(p.method)}</Text>
                  <Text style={[styles.cell, styles.colRight, { fontWeight: 'bold' }]}>R$ {p.total.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendas por Item</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.cellHeader, styles.colMain]}>Produto</Text>
              <Text style={[styles.cellHeader, styles.colCenter]}>Qtd</Text>
              <Text style={[styles.cellHeader, styles.colRight]}>Faturamento</Text>
            </View>
            {soldProducts.map((item, idx) => (
              <View key={idx} style={[styles.tableRow, { backgroundColor: idx % 2 === 1 ? BRAND_COLORS.zebra : '#FFFFFF' }]}>
                <Text style={[styles.cell, styles.colMain, { fontWeight: 'bold' }]}>{item.name}</Text>
                <Text style={[styles.cell, styles.colCenter]}>{item.quantity}</Text>
                <Text style={[styles.cell, styles.colRight, { fontWeight: 'bold' }]}>R$ {item.total.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Movimento Diário</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.cellHeader, { flex: 1 }]}>Data</Text>
              <Text style={[styles.cellHeader, styles.colCenter]}>Pedidos</Text>
              <Text style={[styles.cellHeader, styles.colRight]}>Subtotal</Text>
            </View>
            {report.salesByDay.map((day, idx) => (
              <View key={idx} style={[styles.tableRow, { backgroundColor: idx % 2 === 1 ? BRAND_COLORS.zebra : '#FFFFFF' }]}>
                <Text style={[styles.cell, { flex: 1 }]}>{format(parseISO(day.date), "dd/MM/yyyy")}</Text>
                <Text style={[styles.cell, styles.colCenter]}>{day.count}</Text>
                <Text style={[styles.cell, styles.colRight, { fontWeight: 'bold' }]}>R$ {day.total.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>izziOrder - Relatório Gerencial</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

