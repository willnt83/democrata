import React from 'react';
import { Link } from "react-router-dom";

import { Menu, Icon } from 'antd';

const { SubMenu } = Menu;


const ListMenu = () => (
    <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
        <Menu.Item key="1">
            <Link to="/admin">
                <Icon type="dashboard" />
                <span>Dashboard</span>
            </Link>
        </Menu.Item>
        <SubMenu key="sub1" title={<span><Icon type="bars" /><span>Cadastros</span></span>}>
        <Menu.Item key="2">
                <Link to="/admin/cadastros/unidades">
                    <Icon type="right-square" />
                    <span>Unidades</span>
                </Link>
            </Menu.Item>
            <Menu.Item key="3">
                <Link to="/admin/cadastros/usuarios">
                    <Icon type="right-square" />
                    <span>Usuarios</span>
                </Link>
            </Menu.Item>
            <Menu.Item key="4">
                <Link to="/admin/cadastros/setores">
                    <Icon type="right-square" />
                    <span>Setores</span>
                </Link>
            </Menu.Item>
            <Menu.Item key="5">
                <Link to="/admin/cadastros/sub-setores">
                    <Icon type="right-square" />
                    <span>Sub-setores</span>
                </Link>
            </Menu.Item>
            <Menu.Item key="6">
                <Link to="/admin/cadastros/produtos">
                    <Icon type="right-square" />
                    <span>Produtos</span>
                </Link>
            </Menu.Item>
            <Menu.Item key="7">
                <Link to="/admin/cadastros/sub-produtos">
                    <Icon type="right-square" />
                    <span>Sub-produtos</span>
                </Link>
            </Menu.Item>
            
        </SubMenu>
        <Menu.Item key="8">
            <Link to="/admin/producao">
                <Icon type="area-chart" />
                <span>Produção</span>
            </Link>
        </Menu.Item>
        <Menu.Item key="9">
            <Link to="/admin/estoque">
                <Icon type="gold" />
                <span>Estoque</span>
            </Link>
        </Menu.Item>

        <Menu.Item key="10">
            <Link to="/admin/relatorios">
                <Icon type="bar-chart" />
                <span>Relatórios</span>
            </Link>
        </Menu.Item>
        <Menu.Item key="11">
            <Link to="/admin/configuracoes">
                <Icon type="setting" />
                <span>Configurações</span>
            </Link>
        </Menu.Item>
        <Menu.Item key="12">
            <Link to="/sair">
                <Icon type="export" />
                <span>Sair</span>
            </Link>
        </Menu.Item>
    </Menu>
);

export default ListMenu;