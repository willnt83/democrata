import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select, Tabs } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"

import ArmazemArmazenagem from "./ArmazemArmazenagem"


const { Content } = Layout
const { TabPane } = Tabs;

class Armazem extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Armazém')
    }

    state = {
    }

    tabChange = (tabKey) => {
        console.log('tabKey', tabKey)
    }

    render(){
        return(
            <Content
                style={{
                    margin: "24px 16px",
                    padding: 24,
                    background: "#fff",
                    minHeight: 280
                }}
            >

                <Row>
                    <Col span={24}>
                        <Tabs defaultActiveKey="1" onChange={this.tabChange}>
                            <TabPane tab="Entrada" key="1">
                                Entrada
                            </TabPane>
                            <TabPane tab="Armazenagem" key="2">
                                <ArmazemArmazenagem />
                            </TabPane>
                            <TabPane tab="Saída" key="3">
                                Saída
                            </TabPane>
                        </Tabs>
                    </Col>
                </Row>
          </Content>
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
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(Armazem))