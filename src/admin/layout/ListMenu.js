import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Icon, Modal, Button } from 'antd'
import axios from "axios"
import { connect } from 'react-redux'
import { withRouter } from "react-router-dom"


const { SubMenu } = Menu

class ListMenu extends Component{
    state = {
        showModalLogout: false,
        btnConfirmarLoading: false
    }

    showModalLogout = (bool) => {
        this.setState({showModalLogout : bool})
    }

    logout = () => {
        this.setState({showModalLogout: true})
    }

    handleConfirmLogout = () => {
        this.setState({btnConfirmarLoading: true})
        axios.get(this.props.backEndPoint + '/logout')
        .then(res => {
            if(res.data.success){
                this.setState({btnConfirmarLoading: false})
                this.props.resetAll()
                this.showModalLogout(false)
                window.location.replace("/")
            }
            else{
                this.setState({btnConfirmarLoading: false})
                this.showModalLogout(false)
            }
        })
        .catch(error =>{
            console.log(error)
        })
    }

    render(){
        return(
            <React.Fragment>
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                    <Menu.Item key="1">
                        <Link to="/admin">
                            <Icon type="dashboard" />
                            <span>Dashboard</span>
                        </Link>
                    </Menu.Item>
                    <SubMenu key="sub1" title={<span><Icon type="bars" /><span>Cadastros</span></span>}>
                        <Menu.Item key="2">
                            <Link to="/admin/cadastros/setores">
                                <Icon type="right-square" />
                                <span>Setores</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="3">
                            <Link to="/admin/cadastros/produtos">
                                <Icon type="right-square" />
                                <span>Produtos</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="4">
                            <Link to="/admin/cadastros/subprodutos">
                                <Icon type="right-square" />
                                <span>Subprodutos</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="5">
                            <Link to="/admin/cadastros/conjuntos">
                                <Icon type="right-square" />
                                <span>Conjuntos</span>
                            </Link>
                        </Menu.Item>                      
                        <Menu.Item key="8">
                            <Link to="/admin/cadastros/linha-de-producao">
                                <Icon type="right-square" />
                                <span>Linha de Produção</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="9">
                            <Link to="/admin/cadastros/cores">
                                <Icon type="right-square" />
                                <span>Cores</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="10">
                            <Link to="/admin/cadastros/unidades">
                                <Icon type="right-square" />
                                <span>Unidades</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="11">
                            <Link to="/admin/cadastros/usuarios">
                                <Icon type="right-square" />
                                <span>Usuários</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="12">
                            <Link to="/admin/cadastros/perfis-de-acesso">
                                <Icon type="right-square" />
                                <span>Perfis de Acesso</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="13">
                            <Link to="/admin/cadastros/funcionarios">
                                <Icon type="right-square" />
                                <span>Funcionários</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="14">
                            <Link to="/admin/cadastros/dias-nao-uteis">
                                <Icon type="right-square" />
                                <span>Dias não Úteis</span>
                            </Link>
                        </Menu.Item>
                    </SubMenu>
                    <Menu.Item key="15">
                        <Link to="/admin/producao">
                            <Icon type="area-chart" />
                            <span>Produção</span>
                        </Link>
                    </Menu.Item>

                    <SubMenu key="pcp" title={<span><Icon type="experiment" /><span>PCP</span></span>}>
                        <SubMenu key="pcpCadastros" title={<span><Icon type="bars" /><span>Cadastros</span></span>}>
                            <Menu.Item key="pcpConsolidado">
                                <Link to="/admin/pcp/consolidado">
                                    <Icon type="container" />
                                    <span>Consolidado</span>
                                </Link>
                            </Menu.Item> 
                            <Menu.Item key="pcpCapProdutiva">
                                <Link to="/admin/pcp/capacidadeProdutiva">
                                    <Icon type="stock" />
                                    <span>Cap.Produtiva</span>
                                </Link>
                            </Menu.Item>
                        </SubMenu>
                        <Menu.Item key="pcpGerador">
                            <Link to="/admin/geradorPCP">
                                <Icon type="project" />
                                <span>Gerador PCP</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="pcpAgenda">
                            <Link to="/admin/pcp/agenda">
                                <Icon type="calendar" />
                                <span>Agenda</span>
                            </Link>
                        </Menu.Item>
                    </SubMenu>
                    
                    <SubMenu key="sub2" title={<span><Icon type="solution" /><span>WMS</span></span>}>
                        <SubMenu key="sub3" title={<span><Icon type="bars" /><span>Cadastros</span></span>}>
                            <Menu.Item key="6">
                                <Link to="/admin/wms/unidadesmedida">
                                    <Icon type="right-square" />
                                    <span>Unid. de Medida</span>
                                </Link>
                            </Menu.Item> 
                            <Menu.Item key="61">
                                <Link to="/admin/wms/almoxarifados">
                                    <Icon type="right-square" />
                                    <span>Almoxarifados</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="65">
                                <Link to="/admin/wms/fornecedores">
                                    <Icon type="right-square" />
                                    <span>Fornecedores</span>
                                </Link>
                            </Menu.Item>                                                                       
                            <Menu.Item key="7">
                                <Link to="/admin/wms/insumos">
                                    <Icon type="right-square" />
                                    <span>Insumos</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="62">
                                <Link to="/admin/wms/posicaoarmazem">
                                    <Icon type="right-square" />
                                    <span>Pos. do Armazém</span>
                                </Link>
                            </Menu.Item>
                        </SubMenu>
                        <Menu.Item key="63">
                            <Link to="/admin/wms/pedidoscompra">
                                <Icon type="form" />
                                <span>Ped. de Compra</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="estoque-de-insumos">
                            <Link to="/admin/wms/estoque-de-insumos">
                                <Icon type="database" />
                                <span>Estoque de Insumos</span>
                            </Link>
                        </Menu.Item>
                        <SubMenu key="sub4" title={<span><Icon type="bank" /><span>Armazém</span></span>}>
                            <Menu.Item key="80">
                                <Link to="/admin/wms/armazem/entrada">
                                    <Icon type="right-square" />
                                    <span>Entrada</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="81">
                                <Link to="/admin/wms/armazem/armazenagem">
                                    <Icon type="right-square" />
                                    <span>Armazenagem</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="82">
                                <Link to="/admin/wms/armazem/saida">
                                    <Icon type="right-square" />
                                    <span>Saída</span>
                                </Link>
                            </Menu.Item>
                        </SubMenu>
                    </SubMenu>
                    <SubMenu key="wmsPro01" title={<span><Icon type="solution" /><span>WMS Produtos</span></span>}>
                        <SubMenu key="wmsProCadastro" title={<span><Icon type="bars" /><span>Cadastros</span></span>}>
                            <Menu.Item key="wmsProAlmoxarifado">
                                <Link to="/admin/wms-produto/cadastro/almoxarifado">
                                    <Icon type="right-square" />
                                    <span>Almoxarifados</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="wmsProPosicao">
                                <Link to="/admin/wms-produto/cadastro/posicao">
                                    <Icon type="right-square" />
                                    <span>Posições</span>
                                </Link>
                            </Menu.Item>
                        </SubMenu>
                        <SubMenu key="wmsProArmazem" title={<span><Icon type="bars" /><span>Armazém</span></span>}>
                            <Menu.Item key="wmsProEntrada">
                                <Link to="/admin/wms-produto/armazem/entrada">
                                    <Icon type="right-square" />
                                    <span>Entrada</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="wmsProArmazem">
                                <Link to="/admin/wms-produto/armazem/armazenagem">
                                    <Icon type="right-square" />
                                    <span>Armazenagem</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="wmsProSaida">
                                <Link to="/admin/wms-produto/armazem/saida">
                                    <Icon type="right-square" />
                                    <span>Saída</span>
                                </Link>
                            </Menu.Item>
                        </SubMenu>
                    </SubMenu>

                    <SubMenu key="sub3" title={<span><Icon type="bar-chart" /><span>Relatórios</span></span>}>
                        <Menu.Item key="17">
                            <Link to="/admin/relatorios/produtos-cadastrados">
                                <Icon type="right-square" />
                                <span>Produtos Cadastrados</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="171">
                            <Link to="/admin/relatorios/funcionarios-cadastrados">
                                <Icon type="right-square" />
                                <span>Funcionários Cadastrados</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="18">
                            <Link to="/admin/relatorios/producoes">
                                <Icon type="right-square" />
                                <span>Produções</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="181">
                            <Link to="/admin/relatorios/producoes-analitico">
                                <Icon type="right-square" />
                                <span>Produções Analítico</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="19">
                            <Link to="/admin/relatorios/pontuacoes-por-funcionarios">
                                <Icon type="right-square" />
                                <span>Pontuações por Funcionários</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="191">
                            <Link to="/admin/relatorios/geral-de-lancamento-de-producao">
                                <Icon type="right-square" />
                                <span>Geral de Lançamento de Produção</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="192">
                            <Link to="/admin/relatorios/nao-produzidos">
                                <Icon type="right-square" />
                                <span>Não Produzidos</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="196">
                            <Link to="/admin/relatorios/estoque-de-produtos">
                                <Icon type="right-square" />
                                <span>Estoque de Produtos</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="197">
                            <Link to="/admin/relatorios/saida-de-produtos">
                                <Icon type="right-square" />
                                <span>Saída de Produtos</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="1931">
                            <Link to="/admin/relatorios/pedido-insumos">
                                <Icon type="right-square" />
                                <span>Pedido Insumos</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="193">
                            <Link to="/admin/relatorios/entrada-insumos">
                                <Icon type="right-square" />
                                <span>Entrada Insumos</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="194">
                            <Link to="/admin/relatorios/armazenagem-insumos">
                                <Icon type="right-square" />
                                <span>Armazenagem Insumos</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="195">
                            <Link to="/admin/relatorios/saida-insumos">
                                <Icon type="right-square" />
                                <span>Saída Insumos</span>
                            </Link>
                        </Menu.Item>
                    </SubMenu>
                    <Menu.Item key="20">
                        <Link to="/admin/configuracoes">
                            <Icon type="setting" />
                            <span>Configurações</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="21" onClick={() => this.logout()}>
                        <Icon type="export" />
                        <span>Sair</span>
                    </Menu.Item>
                </Menu>
                <Modal
                    title="Sair do Sistema"
                    visible={this.state.showModalLogout}
                    onOk={this.handleModalLogoutOk}
                    onCancel={() => this.showModalLogout(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showModalLogout(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button className="buttonGreen" key="primary" type="primary" onClick={this.handleConfirmLogout} loading={this.state.btnConfirmarLoading}>
                            <Icon type="check" /> Confirmar
                        </Button>,
                    ]}
                >
                    <p>Você está prestes a sair do sistema. Todos os dados não salvos serão perdidos!</p>
                </Modal>
            </React.Fragment>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        resetAll: () => { dispatch({ type: 'RESET_ALL' }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(withRouter(ListMenu))