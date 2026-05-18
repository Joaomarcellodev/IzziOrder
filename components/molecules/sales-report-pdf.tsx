"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { SalesReport, SalesReportFilters } from '@/lib/entities/report';
import { format, parseISO } from 'date-fns';
import { COLORS, ORDER_TYPE_LABELS } from '@/app/auth/reports/constants';

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
    marginBottom: 35,
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
    if (method.includes("ESPECIE") || method === "DINHEIRO") return "Dinheiro";
    return method.charAt(0) + method.slice(1).toLowerCase().replace("_", " ");
  };

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

        {/* KPIs V3 (Design Original Aprovado) */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, { borderTopColor: BRAND_COLORS.blue }]}>
            <Text style={styles.kpiLabel}>Total Vendido</Text>
            <Text style={styles.kpiValue}>R$ {report.generalTotalSales.toFixed(2)}</Text>
          </View>
          <View style={[styles.kpiCard, { borderTopColor: COLORS.success }]}>
            <Text style={styles.kpiLabel}>Pedidos</Text>
            <Text style={styles.kpiValue}>{totalOrders}</Text>
          </View>
          <View style={[styles.kpiCard, { borderTopColor: COLORS.danger }]}>
            <Text style={styles.kpiLabel}>Ticket Médio</Text>
            <Text style={styles.kpiValue}>R$ {averageTicket.toFixed(2)}</Text>
          </View>
        </View>

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
            {report.salesByProduct.map((item, idx) => (
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
